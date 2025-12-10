// 全局变量存储数据
let summaryData = [];
let vaccineData = [];
let countryData = [];
let filteredSummaryData = [];
let filteredVaccineData = [];
let filteredCountryData = [];
let chartInstances = {};
let mapInstance = null;
let mapMarkers = [];

// 国家坐标映射（主要国家）
const countryCoordinates = {
    'United States': [39.8283, -98.5795],
    'China': [35.8617, 104.1954],
    'India': [20.5937, 78.9629],
    'Brazil': [-14.2350, -51.9253],
    'Russia': [61.5240, 105.3188],
    'United Kingdom': [55.3781, -3.4360],
    'France': [46.2276, 2.2137],
    'Germany': [51.1657, 10.4515],
    'Italy': [41.8719, 12.5674],
    'Spain': [40.4637, -3.7492],
    'Canada': [56.1304, -106.3468],
    'Australia': [-25.2744, 133.7751],
    'Japan': [36.2048, 138.2529],
    'South Korea': [35.9078, 127.7669],
    'Mexico': [23.6345, -102.5528],
    'Argentina': [-38.4161, -63.6167],
    'South Africa': [-30.5595, 22.9375],
    'Turkey': [38.9637, 35.2433],
    'Poland': [51.9194, 19.1451],
    'Netherlands': [52.1326, 5.2913],
    'Belgium': [50.5039, 4.4699],
    'Sweden': [60.1282, 18.6435],
    'Switzerland': [46.8182, 8.2275],
    'Austria': [47.5162, 14.5501],
    'Portugal': [39.3999, -8.2245],
    'Greece': [39.0742, 21.8243],
    'Denmark': [56.2639, 9.5018],
    'Norway': [60.4720, 8.4689],
    'Finland': [61.9241, 25.7482],
    'Ireland': [53.4129, -8.2439],
    'New Zealand': [-40.9006, 174.8860],
    'Chile': [-35.6751, -71.5430],
    'Colombia': [4.5709, -74.2973],
    'Peru': [-9.1900, -75.0152],
    'Venezuela': [6.4238, -66.5897],
    'Ecuador': [-1.8312, -78.1834],
    'Bolivia': [-16.2902, -63.5887],
    'Paraguay': [-23.4425, -58.4438],
    'Uruguay': [-32.5228, -55.7658],
    'Afghanistan': [33.9391, 67.7100],
    'Bangladesh': [23.6850, 90.3563],
    'Pakistan': [30.3753, 69.3451],
    'Indonesia': [-0.7893, 113.9213],
    'Thailand': [15.8700, 100.9925],
    'Vietnam': [14.0583, 108.2772],
    'Philippines': [12.8797, 121.7740],
    'Malaysia': [4.2105, 101.9758],
    'Singapore': [1.3521, 103.8198],
    'Saudi Arabia': [23.8859, 45.0792],
    'United Arab Emirates': [23.4241, 53.8478],
    'Israel': [31.0461, 34.8516],
    'Egypt': [26.8206, 30.8025],
    'Iran': [32.4279, 53.6880],
    'Iraq': [33.2232, 43.6793],
    'Kuwait': [29.3117, 47.4818],
    'Qatar': [25.3548, 51.1839],
    'Oman': [21.4735, 55.9754],
    'Yemen': [15.5527, 48.5164],
    'Jordan': [30.5852, 36.2384],
    'Lebanon': [33.8547, 35.8623],
    'Syria': [34.8021, 38.9968],
    'Nigeria': [9.0820, 8.6753],
    'Kenya': [-0.0236, 37.9062],
    'Ethiopia': [9.1450, 38.7667],
    'Ghana': [7.9465, -1.0232],
    'Tanzania': [-6.3690, 34.8888],
    'Uganda': [1.3733, 32.2903],
    'Morocco': [31.7917, -7.0926],
    'Algeria': [28.0339, 1.6596],
    'Tunisia': [33.8869, 9.5375],
    'Libya': [26.3351, 17.2283],
    'Sudan': [12.8628, 30.2176],
    'Ukraine': [48.3794, 31.1656],
    'Romania': [45.9432, 24.9668],
    'Czech Republic': [49.8175, 15.4730],
    'Hungary': [47.1625, 19.5033],
    'Bulgaria': [42.7339, 25.4858],
    'Croatia': [45.1000, 15.2000],
    'Serbia': [44.0165, 21.0059],
    'Slovakia': [48.6690, 19.6990],
    'Slovenia': [46.1512, 14.9955]
};

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
        // 延迟初始化地图，确保DOM已渲染
        setTimeout(() => {
            initializeMap();
        }, 100);
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
    // 设置日期范围
    if (summaryData.length > 0) {
        const dates = summaryData.map(d => new Date(d.date)).filter(d => !isNaN(d.getTime()));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        document.getElementById('startDate').value = minDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = maxDate.toISOString().split('T')[0];
        // 设置地图日期为最新日期
        document.getElementById('mapDate').value = maxDate.toISOString().split('T')[0];
    }
}

// 初始化地图
function initializeMap() {
    if (mapInstance) {
        mapInstance.remove();
    }
    
    mapInstance = L.map('map').setView([20, 0], 2);
    
    // 添加地图图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(mapInstance);
    
    // 初始化地图数据
    updateMap();
}

// 更新地图
function updateMap() {
    if (!mapInstance) return;
    
    // 清除现有标记
    mapMarkers.forEach(marker => mapInstance.removeLayer(marker));
    mapMarkers = [];
    
    const selectedDate = document.getElementById('mapDate').value;
    if (!selectedDate) return;
    
    // 获取选定日期的数据
    const dateData = {};
    filteredCountryData.forEach(item => {
        if (item.date && item.country && item.Cumulative_deaths !== null && item.Cumulative_deaths !== undefined) {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            if (itemDate === selectedDate) {
                if (!dateData[item.country] || item.Cumulative_deaths > dateData[item.country]) {
                    dateData[item.country] = item.Cumulative_deaths;
                }
            }
        }
    });
    
    // 找到最大死亡数用于颜色映射
    const maxDeaths = Math.max(...Object.values(dateData), 1);
    
    // 为每个国家添加标记
    Object.entries(dateData).forEach(([country, deaths]) => {
        const coords = countryCoordinates[country];
        if (coords && deaths > 0) {
            // 根据死亡数计算颜色（红色深浅）
            const intensity = Math.min(deaths / maxDeaths, 1);
            const color = `rgb(${Math.floor(255 * intensity)}, 0, 0)`;
            
            // 计算标记大小
            const radius = Math.max(5, Math.min(30, Math.sqrt(deaths) / 100));
            
            const circle = L.circleMarker(coords, {
                radius: radius,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            }).addTo(mapInstance);
            
            // 添加弹出窗口
            circle.bindPopup(`
                <strong>${country}</strong><br>
                Deaths: ${(deaths / 1000).toFixed(0)}K<br>
                Date: ${selectedDate}
            `);
            
            mapMarkers.push(circle);
        }
    });
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
    filteredCountryData = countryData.filter(d => {
        const date = new Date(d.date);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date(9999, 11, 31);
        return date >= start && date <= end;
    });

    // 筛选vaccine数据
    filteredVaccineData = [...vaccineData];

    // 更新统计
    updateStats();

    // 销毁旧图表
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    chartInstances = {};

    // 重新创建图表
    createCharts();
    
    // 更新地图
    updateMap();
}

// 重置筛选
function resetFilters() {
    if (summaryData.length > 0) {
        const dates = summaryData.map(d => new Date(d.date)).filter(d => !isNaN(d.getTime()));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        document.getElementById('startDate').value = minDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = maxDate.toISOString().split('T')[0];
        document.getElementById('mapDate').value = maxDate.toISOString().split('T')[0];
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
    
    // 更新地图
    updateMap();
}

// 页面加载时加载数据
window.addEventListener('DOMContentLoaded', loadData);

