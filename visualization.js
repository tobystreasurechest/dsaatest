// 全局变量存储数据
let summaryData = [];
let vaccineData = [];
let countryData = [];
let filteredSummaryData = [];
let filteredVaccineData = [];
let filteredCountryData = [];
let chartInstances = {};

// 加载JSON数据
async function loadData() {
    try {
        const [summaryRes, vaccineRes, dataRes] = await Promise.all([
            fetch('summary.json'),
            fetch('vaccine.json'),
            fetch('data.json')
        ]);

        summaryData = await summaryRes.json();
        vaccineData = await vaccineRes.json();
        countryData = await dataRes.json();

        // 初始化过滤数据
        filteredSummaryData = [...summaryData];
        filteredVaccineData = [...vaccineData];
        filteredCountryData = [...countryData];

        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // 初始化控制面板
        initializeControls();
        updateStats();
        createCharts();
    } catch (error) {
        console.error('加载数据时出错:', error);
        document.getElementById('loading').textContent = '加载数据失败，请检查JSON文件路径';
    }
}

// 创建所有图表
function createCharts() {
    createVaccinationOverTimeChart();
    createDeathOverTimeChart();
    createSpatialPatternsChart();
    createVaccinationDeathRelationChart();
}

// 图表1: Vaccination Over Time Across Countries
function createVaccinationOverTimeChart() {
    // 按国家和日期组织数据
    const countryTimeData = {};
    const allDates = new Set();
    
    filteredCountryData.forEach(item => {
        if (item.country && item.date && item.total_vaccinations !== null && item.total_vaccinations !== undefined) {
            const date = new Date(item.date).toISOString().split('T')[0];
            allDates.add(date);
            
            if (!countryTimeData[item.country]) {
                countryTimeData[item.country] = {};
            }
            // 使用最大值（累计值）
            if (!countryTimeData[item.country][date] || item.total_vaccinations > countryTimeData[item.country][date]) {
                countryTimeData[item.country][date] = item.total_vaccinations;
            }
        }
    });

    // 获取前N个国家（按最终累计疫苗接种数）
    const topN = parseInt(document.getElementById('topN').value);
    const countryTotals = Object.entries(countryTimeData).map(([country, dates]) => {
        const maxVaccination = Math.max(...Object.values(dates));
        return [country, maxVaccination];
    }).sort((a, b) => b[1] - a[1]).slice(0, topN);

    const selectedCountries = countryTotals.map(c => c[0]);
    
    // 排序日期
    const sortedDates = Array.from(allDates).sort();
    const displayDates = sortedDates.filter((_, i) => i % 30 === 0); // 每30个点显示一个

    // 生成颜色
    const colors = [
        'rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)', 
        'rgb(255, 206, 86)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)',
        'rgb(199, 199, 199)', 'rgb(83, 102, 255)', 'rgb(255, 99, 255)', 
        'rgb(99, 255, 132)', 'rgb(255, 159, 64)', 'rgb(54, 162, 235)',
        'rgb(255, 99, 132)', 'rgb(75, 192, 192)', 'rgb(255, 206, 86)',
        'rgb(153, 102, 255)', 'rgb(255, 159, 64)', 'rgb(199, 199, 199)',
        'rgb(83, 102, 255)', 'rgb(255, 99, 255)'
    ];

    const datasets = selectedCountries.map((country, index) => {
        const data = displayDates.map(date => {
            return countryTimeData[country][date] || null;
        });
        return {
            label: country,
            data: data,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
            tension: 0.4,
            fill: false
        };
    });

    if (chartInstances.vaccinationOverTimeChart) {
        chartInstances.vaccinationOverTimeChart.destroy();
    }

    chartInstances.vaccinationOverTimeChart = new Chart(document.getElementById('vaccinationOverTimeChart'), {
        type: 'line',
        data: {
            labels: displayDates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value === null) return context.dataset.label + ': No data';
                            return context.dataset.label + ': ' + (value / 1000000).toFixed(1) + 'M';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000).toFixed(0) + 'M';
                        }
                    }
                }
            }
        }
    });
}

// 图表2: Death Populations Over Time
function createDeathOverTimeChart() {
    // 按国家和日期组织死亡数据
    const countryDeathData = {};
    const allDates = new Set();
    
    filteredCountryData.forEach(item => {
        if (item.country && item.date && item.Cumulative_deaths !== null && item.Cumulative_deaths !== undefined) {
            const date = new Date(item.date).toISOString().split('T')[0];
            allDates.add(date);
            
            if (!countryDeathData[item.country]) {
                countryDeathData[item.country] = {};
            }
            // 使用最大值（累计值）
            if (!countryDeathData[item.country][date] || item.Cumulative_deaths > countryDeathData[item.country][date]) {
                countryDeathData[item.country][date] = item.Cumulative_deaths;
            }
        }
    });

    // 获取前N个国家（按最终累计死亡数）
    const topN = parseInt(document.getElementById('topN').value);
    const countryTotals = Object.entries(countryDeathData).map(([country, dates]) => {
        const maxDeaths = Math.max(...Object.values(dates));
        return [country, maxDeaths];
    }).sort((a, b) => b[1] - a[1]).slice(0, topN);

    const selectedCountries = countryTotals.map(c => c[0]);
    
    // 排序日期
    const sortedDates = Array.from(allDates).sort();
    const displayDates = sortedDates.filter((_, i) => i % 30 === 0);

    // 生成颜色
    const colors = [
        'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(75, 192, 192)', 
        'rgb(255, 206, 86)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)',
        'rgb(199, 199, 199)', 'rgb(83, 102, 255)', 'rgb(255, 99, 255)', 
        'rgb(99, 255, 132)'
    ];

    const datasets = selectedCountries.map((country, index) => {
        const data = displayDates.map(date => {
            return countryDeathData[country][date] || null;
        });
        return {
            label: country,
            data: data,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
            tension: 0.4,
            fill: false
        };
    });

    if (chartInstances.deathOverTimeChart) {
        chartInstances.deathOverTimeChart.destroy();
    }

    chartInstances.deathOverTimeChart = new Chart(document.getElementById('deathOverTimeChart'), {
        type: 'line',
        data: {
            labels: displayDates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value === null) return context.dataset.label + ': No data';
                            return context.dataset.label + ': ' + (value / 1000).toFixed(0) + 'K';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}

// 图表3: Global Spatial Patterns of Vaccination and Mortality
function createSpatialPatternsChart() {
    // 按国家汇总最新数据
    const countryStats = {};
    
    filteredCountryData.forEach(item => {
        if (item.country) {
            if (!countryStats[item.country]) {
                countryStats[item.country] = {
                    vaccinations: 0,
                    deaths: 0,
                    cases: 0
                };
            }
            if (item.total_vaccinations) {
                countryStats[item.country].vaccinations = Math.max(
                    countryStats[item.country].vaccinations,
                    item.total_vaccinations
                );
            }
            if (item.Cumulative_deaths) {
                countryStats[item.country].deaths = Math.max(
                    countryStats[item.country].deaths,
                    item.Cumulative_deaths
                );
            }
            if (item.Cumulative_cases) {
                countryStats[item.country].cases = Math.max(
                    countryStats[item.country].cases,
                    item.Cumulative_cases
                );
            }
        }
    });

    // 转换为散点图数据格式
    const scatterData = Object.entries(countryStats)
        .filter(([country, stats]) => stats.vaccinations > 0 && stats.deaths > 0)
        .map(([country, stats]) => ({
            x: stats.vaccinations,
            y: stats.deaths,
            country: country,
            cases: stats.cases
        }));

    if (chartInstances.spatialPatternsChart) {
        chartInstances.spatialPatternsChart.destroy();
    }

    chartInstances.spatialPatternsChart = new Chart(document.getElementById('spatialPatternsChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Countries',
                data: scatterData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].raw.country;
                        },
                        label: function(context) {
                            const data = context[0].raw;
                            return [
                                'Vaccinations: ' + (data.x / 1000000).toFixed(1) + 'M',
                                'Deaths: ' + (data.y / 1000).toFixed(0) + 'K',
                                'Cases: ' + (data.cases / 1000000).toFixed(1) + 'M'
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Total Vaccinations'
                    },
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000).toFixed(0) + 'M';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Deaths'
                    },
                    ticks: {
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}

// 图表4: Vaccinations and Death Relations
function createVaccinationDeathRelationChart() {
    // 按国家汇总最新数据
    const countryStats = {};
    
    filteredCountryData.forEach(item => {
        if (item.country) {
            if (!countryStats[item.country]) {
                countryStats[item.country] = {
                    vaccinations: 0,
                    deaths: 0
                };
            }
            if (item.total_vaccinations) {
                countryStats[item.country].vaccinations = Math.max(
                    countryStats[item.country].vaccinations,
                    item.total_vaccinations
                );
            }
            if (item.Cumulative_deaths) {
                countryStats[item.country].deaths = Math.max(
                    countryStats[item.country].deaths,
                    item.Cumulative_deaths
                );
            }
        }
    });

    // 转换为散点图数据
    const scatterData = Object.entries(countryStats)
        .filter(([country, stats]) => stats.vaccinations > 0 && stats.deaths > 0)
        .map(([country, stats]) => ({
            x: stats.vaccinations,
            y: stats.deaths,
            country: country
        }));

    if (chartInstances.vaccinationDeathRelationChart) {
        chartInstances.vaccinationDeathRelationChart.destroy();
    }

    chartInstances.vaccinationDeathRelationChart = new Chart(document.getElementById('vaccinationDeathRelationChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Countries',
                data: scatterData,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].raw.country;
                        },
                        label: function(context) {
                            const data = context.raw;
                            return [
                                'Vaccinations: ' + (data.x / 1000000).toFixed(1) + 'M',
                                'Deaths: ' + (data.y / 1000).toFixed(0) + 'K'
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Total Vaccinations'
                    },
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000).toFixed(0) + 'M';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Deaths'
                    },
                    ticks: {
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}

// 初始化控制面板
function initializeControls() {
    // 填充国家列表
    const countries = [...new Set(countryData.map(d => d.country).filter(Boolean))].sort();
    const countryFilter = document.getElementById('countryFilter');
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });

    // 设置日期范围
    if (summaryData.length > 0) {
        const dates = summaryData.map(d => new Date(d.date)).filter(d => !isNaN(d.getTime()));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        document.getElementById('startDate').value = minDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = maxDate.toISOString().split('T')[0];
    }
}

// 更新统计卡片
function updateStats() {
    const statsBar = document.getElementById('statsBar');
    const latest = filteredSummaryData[filteredSummaryData.length - 1] || {};
    
    const totalCases = latest.Cumulative_cases || 0;
    const totalDeaths = latest.Cumulative_deaths || 0;
    const totalVaccinations = latest.total_vaccinations || 0;
    
    // 计算疫苗类型数量
    const vaccineTypes = new Set(filteredVaccineData.map(d => d.vaccine).filter(Boolean)).size;
    
    statsBar.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${(totalCases / 1000000).toFixed(1)}M</div>
            <div class="stat-label">Total Cases</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${(totalDeaths / 1000).toFixed(0)}K</div>
            <div class="stat-label">Total Deaths</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${(totalVaccinations / 1000000000).toFixed(2)}B</div>
            <div class="stat-label">Total Vaccinations</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${vaccineTypes}</div>
            <div class="stat-label">Vaccine Types</div>
        </div>
    `;
}

// 应用筛选
function applyFilters() {
    const country = document.getElementById('countryFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const topN = parseInt(document.getElementById('topN').value);

    // 筛选summary数据
    filteredSummaryData = summaryData.filter(d => {
        const date = new Date(d.date);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date(9999, 11, 31);
        return date >= start && date <= end;
    });

    // 筛选country数据
    if (country === 'all') {
        filteredCountryData = [...countryData];
    } else {
        filteredCountryData = countryData.filter(d => d.country === country);
    }

    // 筛选vaccine数据
    if (country === 'all') {
        filteredVaccineData = [...vaccineData];
    } else {
        filteredVaccineData = vaccineData.filter(d => d.location === country);
    }

    // 图表标题不需要更新，因为它们是固定的

    // 更新统计
    updateStats();

    // 销毁旧图表
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    chartInstances = {};

    // 重新创建图表
    createCharts();
}

// 重置筛选
function resetFilters() {
    document.getElementById('countryFilter').value = 'all';
    if (summaryData.length > 0) {
        const dates = summaryData.map(d => new Date(d.date)).filter(d => !isNaN(d.getTime()));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        document.getElementById('startDate').value = minDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = maxDate.toISOString().split('T')[0];
    }
    document.getElementById('topN').value = '10';

    filteredSummaryData = [...summaryData];
    filteredVaccineData = [...vaccineData];
    filteredCountryData = [...countryData];

    updateStats();

    // 销毁旧图表
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    chartInstances = {};

    // 重新创建图表
    createCharts();
}

// 页面加载时加载数据
window.addEventListener('DOMContentLoaded', loadData);

