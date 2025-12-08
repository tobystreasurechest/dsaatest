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
    createTimeSeriesChart();
    createVaccinationChart();
    createVaccineTypeChart();
    createCountryCharts();
}

// 图表1: 时间序列 - 累计病例和死亡
function createTimeSeriesChart() {
    const dates = filteredSummaryData.map(d => new Date(d.date).toLocaleDateString('zh-CN'));
    const cases = filteredSummaryData.map(d => d.Cumulative_cases);
    const deaths = filteredSummaryData.map(d => d.Cumulative_deaths);

    if (chartInstances.timeSeriesChart) {
        chartInstances.timeSeriesChart.destroy();
    }

    chartInstances.timeSeriesChart = new Chart(document.getElementById('timeSeriesChart'), {
        type: 'line',
        data: {
            labels: dates.filter((_, i) => i % 30 === 0), // 每30个点显示一个标签
            datasets: [
                {
                    label: '累计病例',
                    data: cases.filter((_, i) => i % 30 === 0),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '累计死亡',
                    data: deaths.filter((_, i) => i % 30 === 0),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                    }
                }
            }
        }
    });
}

// 图表2: 时间序列 - 疫苗接种
function createVaccinationChart() {
    const dates = filteredSummaryData.map(d => new Date(d.date).toLocaleDateString('zh-CN'));
    const vaccinations = filteredSummaryData.map(d => d.total_vaccinations);

    if (chartInstances.vaccinationChart) {
        chartInstances.vaccinationChart.destroy();
    }

    chartInstances.vaccinationChart = new Chart(document.getElementById('vaccinationChart'), {
        type: 'line',
        data: {
            labels: dates.filter((_, i) => i % 30 === 0),
            datasets: [{
                label: '总疫苗接种数',
                data: vaccinations.filter((_, i) => i % 30 === 0),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000000).toFixed(2) + 'B';
                        }
                    }
                }
            }
        }
    });
}

// 图表3: 疫苗类型分布
function createVaccineTypeChart() {
    // 按疫苗类型汇总
    const vaccineStats = {};
    filteredVaccineData.forEach(item => {
        if (item.vaccine && item.total_vaccinations) {
            if (!vaccineStats[item.vaccine]) {
                vaccineStats[item.vaccine] = 0;
            }
            vaccineStats[item.vaccine] += item.total_vaccinations;
        }
    });

    // 排序并取前N
    const topN = parseInt(document.getElementById('topN').value);
    const sorted = Object.entries(vaccineStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    if (chartInstances.vaccineTypeChart) {
        chartInstances.vaccineTypeChart.destroy();
    }

    const colors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(255, 99, 255, 0.8)',
        'rgba(99, 255, 132, 0.8)'
    ];

    chartInstances.vaccineTypeChart = new Chart(document.getElementById('vaccineTypeChart'), {
        type: 'pie',
        data: {
            labels: sorted.map(item => item[0]),
            datasets: [{
                data: sorted.map(item => item[1]),
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return context.label + ': ' + (value / 1000000).toFixed(1) + 'M (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// 图表4-6: 国家对比图表
function createCountryCharts() {
    // 按国家汇总数据
    const countryStats = {};
    filteredCountryData.forEach(item => {
        if (item.country) {
            if (!countryStats[item.country]) {
                countryStats[item.country] = {
                    vaccinations: 0,
                    cases: 0,
                    deaths: 0
                };
            }
            if (item.total_vaccinations) {
                countryStats[item.country].vaccinations = Math.max(
                    countryStats[item.country].vaccinations,
                    item.total_vaccinations
                );
            }
            if (item.Cumulative_cases) {
                countryStats[item.country].cases = Math.max(
                    countryStats[item.country].cases,
                    item.Cumulative_cases
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

    // 疫苗接种对比
    const topN = parseInt(document.getElementById('topN').value);
    const topVaccinations = Object.entries(countryStats)
        .map(([country, stats]) => [country, stats.vaccinations])
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    if (chartInstances.countryVaccinationChart) {
        chartInstances.countryVaccinationChart.destroy();
    }

    chartInstances.countryVaccinationChart = new Chart(document.getElementById('countryVaccinationChart'), {
        type: 'bar',
        data: {
            labels: topVaccinations.map(item => item[0]),
            datasets: [{
                label: '总疫苗接种数',
                data: topVaccinations.map(item => item[1]),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
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

    // 病例对比
    const topCases = Object.entries(countryStats)
        .map(([country, stats]) => [country, stats.cases])
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    if (chartInstances.countryCasesChart) {
        chartInstances.countryCasesChart.destroy();
    }

    chartInstances.countryCasesChart = new Chart(document.getElementById('countryCasesChart'), {
        type: 'bar',
        data: {
            labels: topCases.map(item => item[0]),
            datasets: [{
                label: '累计病例',
                data: topCases.map(item => item[1]),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                    }
                }
            }
        }
    });

    // 死亡对比
    const topDeaths = Object.entries(countryStats)
        .map(([country, stats]) => [country, stats.deaths])
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    if (chartInstances.countryDeathsChart) {
        chartInstances.countryDeathsChart.destroy();
    }

    chartInstances.countryDeathsChart = new Chart(document.getElementById('countryDeathsChart'), {
        type: 'bar',
        data: {
            labels: topDeaths.map(item => item[0]),
            datasets: [{
                label: '累计死亡',
                data: topDeaths.map(item => item[1]),
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
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
            <div class="stat-label">累计病例</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${(totalDeaths / 1000).toFixed(0)}K</div>
            <div class="stat-label">累计死亡</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${(totalVaccinations / 1000000000).toFixed(2)}B</div>
            <div class="stat-label">总疫苗接种</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${vaccineTypes}</div>
            <div class="stat-label">疫苗类型数</div>
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

    // 更新标题
    document.getElementById('vaccineTypeTitle').textContent = `疫苗类型分布（前${topN}名）`;
    document.getElementById('countryVaccinationTitle').textContent = `国家疫苗接种对比（前${topN}名）`;
    document.getElementById('countryCasesTitle').textContent = `国家累计病例对比（前${topN}名）`;
    document.getElementById('countryDeathsTitle').textContent = `国家累计死亡对比（前${topN}名）`;

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

    // 更新标题
    document.getElementById('vaccineTypeTitle').textContent = '疫苗类型分布（前10名）';
    document.getElementById('countryVaccinationTitle').textContent = '国家疫苗接种对比（前10名）';
    document.getElementById('countryCasesTitle').textContent = '国家累计病例对比（前10名）';
    document.getElementById('countryDeathsTitle').textContent = '国家累计死亡对比（前10名）';

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

