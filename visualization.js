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

// ISO代码到坐标的映射（使用ISO 3166-1 alpha-3代码）
const isoCodeCoordinates = {
    'AFG': [33.9391, 67.7100], // Afghanistan
    'ALB': [41.1533, 20.1683], // Albania
    'DZA': [28.0339, 1.6596], // Algeria
    'ARG': [-38.4161, -63.6167], // Argentina
    'AUS': [-25.2744, 133.7751], // Australia
    'AUT': [47.5162, 14.5501], // Austria
    'BGD': [23.6850, 90.3563], // Bangladesh
    'BEL': [50.5039, 4.4699], // Belgium
    'BOL': [-16.2902, -63.5887], // Bolivia
    'BRA': [-14.2350, -51.9253], // Brazil
    'BGR': [42.7339, 25.4858], // Bulgaria
    'CAN': [56.1304, -106.3468], // Canada
    'CHL': [-35.6751, -71.5430], // Chile
    'CHN': [35.8617, 104.1954], // China
    'COL': [4.5709, -74.2973], // Colombia
    'HRV': [45.1000, 15.2000], // Croatia
    'CZE': [49.8175, 15.4730], // Czech Republic
    'DNK': [56.2639, 9.5018], // Denmark
    'ECU': [-1.8312, -78.1834], // Ecuador
    'EGY': [26.8206, 30.8025], // Egypt
    'FIN': [61.9241, 25.7482], // Finland
    'FRA': [46.2276, 2.2137], // France
    'DEU': [51.1657, 10.4515], // Germany
    'GHA': [7.9465, -1.0232], // Ghana
    'GRC': [39.0742, 21.8243], // Greece
    'HUN': [47.1625, 19.5033], // Hungary
    'IND': [20.5937, 78.9629], // India
    'IDN': [-0.7893, 113.9213], // Indonesia
    'IRN': [32.4279, 53.6880], // Iran
    'IRQ': [33.2232, 43.6793], // Iraq
    'IRL': [53.4129, -8.2439], // Ireland
    'ISR': [31.0461, 34.8516], // Israel
    'ITA': [41.8719, 12.5674], // Italy
    'JPN': [36.2048, 138.2529], // Japan
    'JOR': [30.5852, 36.2384], // Jordan
    'KEN': [-0.0236, 37.9062], // Kenya
    'KWT': [29.3117, 47.4818], // Kuwait
    'LBN': [33.8547, 35.8623], // Lebanon
    'LBY': [26.3351, 17.2283], // Libya
    'MYS': [4.2105, 101.9758], // Malaysia
    'MEX': [23.6345, -102.5528], // Mexico
    'MAR': [31.7917, -7.0926], // Morocco
    'NLD': [52.1326, 5.2913], // Netherlands
    'NZL': [-40.9006, 174.8860], // New Zealand
    'NGA': [9.0820, 8.6753], // Nigeria
    'NOR': [60.4720, 8.4689], // Norway
    'OMN': [21.4735, 55.9754], // Oman
    'PAK': [30.3753, 69.3451], // Pakistan
    'PRY': [-23.4425, -58.4438], // Paraguay
    'PER': [-9.1900, -75.0152], // Peru
    'PHL': [12.8797, 121.7740], // Philippines
    'POL': [51.9194, 19.1451], // Poland
    'PRT': [39.3999, -8.2245], // Portugal
    'QAT': [25.3548, 51.1839], // Qatar
    'ROU': [45.9432, 24.9668], // Romania
    'RUS': [61.5240, 105.3188], // Russia
    'SAU': [23.8859, 45.0792], // Saudi Arabia
    'SRB': [44.0165, 21.0059], // Serbia
    'SGP': [1.3521, 103.8198], // Singapore
    'SVK': [48.6690, 19.6990], // Slovakia
    'SVN': [46.1512, 14.9955], // Slovenia
    'ZAF': [-30.5595, 22.9375], // South Africa
    'KOR': [35.9078, 127.7669], // South Korea
    'ESP': [40.4637, -3.7492], // Spain
    'SDN': [12.8628, 30.2176], // Sudan
    'SWE': [60.1282, 18.6435], // Sweden
    'CHE': [46.8182, 8.2275], // Switzerland
    'SYR': [34.8021, 38.9968], // Syria
    'TZA': [-6.3690, 34.8888], // Tanzania
    'THA': [15.8700, 100.9925], // Thailand
    'TUN': [33.8869, 9.5375], // Tunisia
    'TUR': [38.9637, 35.2433], // Turkey
    'UGA': [1.3733, 32.2903], // Uganda
    'UKR': [48.3794, 31.1656], // Ukraine
    'ARE': [23.4241, 53.8478], // United Arab Emirates
    'GBR': [55.3781, -3.4360], // United Kingdom
    'USA': [39.8283, -98.5795], // United States
    'URY': [-32.5228, -55.7658], // Uruguay
    'VEN': [6.4238, -66.5897], // Venezuela
    'VNM': [14.0583, 108.2772], // Vietnam
    'YEM': [15.5527, 48.5164] // Yemen
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
    
    const selectedDateObj = new Date(selectedDate);
    
    // 获取选定日期及之前的数据（用于向前填充）
    // 使用ISO代码作为键，存储国家名称、日期和累计死亡数的映射
    const isoDateData = {};
    
    filteredCountryData.forEach(item => {
        if (item.date && item.iso_code && item.country && item.Cumulative_deaths !== null && item.Cumulative_deaths !== undefined) {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            const itemDateObj = new Date(item.date);
            
            // 只处理选定日期及之前的数据
            if (itemDateObj <= selectedDateObj) {
                if (!isoDateData[item.iso_code]) {
                    isoDateData[item.iso_code] = {
                        country: item.country,
                        dates: {}
                    };
                }
                
                // 如果同一天有多条记录，取最大的累计死亡数
                if (!isoDateData[item.iso_code].dates[itemDate] || 
                    item.Cumulative_deaths > isoDateData[item.iso_code].dates[itemDate]) {
                    isoDateData[item.iso_code].dates[itemDate] = item.Cumulative_deaths;
                }
            }
        }
    });
    
    // 为每个ISO代码找到选定日期或最近日期的数据
    const dateData = {}; // key: iso_code, value: {country, deaths}
    Object.keys(isoDateData).forEach(isoCode => {
        const dates = Object.keys(isoDateData[isoCode].dates)
            .map(d => new Date(d))
            .sort((a, b) => b - a); // 从新到旧排序
        
        // 找到选定日期或最近的数据
        let targetDate = null;
        for (let date of dates) {
            if (date <= selectedDateObj) {
                targetDate = date.toISOString().split('T')[0];
                break;
            }
        }
        
        // 如果找到了数据，使用它
        if (targetDate && isoDateData[isoCode].dates[targetDate]) {
            dateData[isoCode] = {
                country: isoDateData[isoCode].country,
                deaths: isoDateData[isoCode].dates[targetDate]
            };
        }
    });
    
    // 找到最大死亡数用于颜色映射
    const maxDeaths = Math.max(...Object.values(dateData).map(d => d.deaths), 1);
    
    // 为每个国家添加标记
    Object.entries(dateData).forEach(([isoCode, data]) => {
        const { country, deaths } = data;
        const coords = isoCodeCoordinates[isoCode];
        if (coords && deaths > 0) {
            // 将死亡数分成5个等级
            const intensity = Math.min(deaths / maxDeaths, 1);
            let color;
            
            // 5个颜色等级：从浅到深
            if (intensity < 0.2) {
                // 等级1：非常浅的粉色（死亡数最少）
                color = 'rgb(255, 240, 245)';
            } else if (intensity < 0.4) {
                // 等级2：浅粉色
                color = 'rgb(255, 182, 193)';
            } else if (intensity < 0.6) {
                // 等级3：粉色
                color = 'rgb(255, 105, 180)';
            } else if (intensity < 0.8) {
                // 等级4：红色
                color = 'rgb(220, 20, 60)';
            } else {
                // 等级5：深红色（死亡数最多）
                color = 'rgb(139, 0, 0)';
            }
            
            // 计算标记大小：使用平方缩放让不同死亡数的半径差异更明显
            // 平方可以让差异更突出，死亡数小的半径更小，死亡数大的半径更大
            const normalized = deaths / maxDeaths; // 0到1之间
            const sizeRatio = normalized * normalized; // 平方，让差异更明显
            // 半径范围：最小8，最大55，范围47，让差异更明显
            const radius = Math.max(8, Math.min(30, 8 + sizeRatio * 22));
            
            const circle = L.circleMarker(coords, {
                radius: radius,
                fillColor: color,
                color: '#333',
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(mapInstance);
            
            // 创建自定义tooltip
            const tooltip = L.tooltip({
                permanent: false,
                direction: 'top',
                offset: [0, -10]
            }).setContent(`
                <div style="font-weight: bold; margin-bottom: 4px;">${country}</div>
                <div>Deaths: ${(deaths / 1000).toFixed(0)}K</div>
                <div style="font-size: 11px; color: #666;">Date: ${selectedDate}</div>
            `);
            
            // 添加hover事件
            circle.on('mouseover', function(e) {
                this.setStyle({
                    weight: 3,
                    fillOpacity: 1,
                    color: '#000'
                });
                circle.bindTooltip(tooltip).openTooltip();
            });
            
            circle.on('mouseout', function(e) {
                this.setStyle({
                    weight: 1.5,
                    fillOpacity: 0.8,
                    color: '#333'
                });
                circle.closeTooltip();
            });
            
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

