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
let missingIsoLogged = false;
let relationChartState = {
    isCountryView: false,
    selectedCountry: null,
    originalData: null,
    originalDate: null
};

// ISO代码到坐标的映射（使用ISO 3166-1 alpha-3代码）
const isoCodeCoordinates = {
    AFG: [33.9391, 67.7100], ALB: [41.1533, 20.1683], DZA: [28.0339, 1.6596],
    ASM: [-14.2709, -170.1322], AND: [42.5063, 1.5218], AGO: [-11.2027, 17.8739],
    ATG: [17.0608, -61.7964], ARG: [-38.4161, -63.6167], ARM: [40.0691, 45.0382],
    ABW: [12.5211, -69.9683], AUS: [-25.2744, 133.7751], AUT: [47.5162, 14.5501],
    AZE: [40.1431, 47.5769], BHS: [25.0343, -77.3963], BHR: [25.9304, 50.6378],
    BGD: [23.6850, 90.3563], BRB: [13.1939, -59.5432], BLR: [53.7098, 27.9534],
    BEL: [50.5039, 4.4699], BLZ: [17.1899, -88.4976], BEN: [9.3077, 2.3158],
    BMU: [32.3078, -64.7505], BTN: [27.5142, 90.4336], BOL: [-16.2902, -63.5887],
    BES: [12.1784, -68.2385], BIH: [43.9159, 17.6791], BWA: [-22.3285, 24.6849],
    BRA: [-14.2350, -51.9253], IOT: [-6.3432, 71.8765], VGB: [18.4207, -64.6400],
    BRN: [4.5353, 114.7277], BGR: [42.7339, 25.4858], BFA: [12.2383, -1.5616],
    BDI: [-3.3731, 29.9189], CPV: [16.5388, -23.0418], KHM: [12.5657, 104.9910],
    CMR: [7.3697, 12.3547], CAN: [56.1304, -106.3468], CYM: [19.3133, -81.2546],
    CAF: [6.6111, 20.9394], TCD: [15.4542, 18.7322], CHL: [-35.6751, -71.5430],
    CHN: [35.8617, 104.1954], COL: [4.5709, -74.2973], COM: [-11.6455, 43.3333],
    COD: [-4.0383, 21.7587], COG: [-0.2280, 15.8277], COK: [-21.2367, -159.7777],
    CRI: [9.7489, -83.7534], HRV: [45.1000, 15.2000], CUB: [21.5218, -77.7812],
    CUW: [12.1696, -68.9900], CYP: [35.1264, 33.4299], CZE: [49.8175, 15.4730],
    DNK: [56.2639, 9.5018], DJI: [11.8251, 42.5903], DMA: [15.4140, -61.3700],
    DOM: [18.7357, -70.1627], ECU: [-1.8312, -78.1834], EGY: [26.8206, 30.8025],
    SLV: [13.7942, -88.8965], GNQ: [1.6508, 10.2679], ERI: [15.1794, 39.7823],
    EST: [58.5953, 25.0136], SWZ: [-26.5225, 31.4659], ETH: [9.1450, 40.4897],
    FLK: [-51.7963, -59.5236], FRO: [61.8926, -6.9118], FJI: [-17.7134, 178.0650],
    FIN: [61.9241, 25.7482], FRA: [46.2276, 2.2137], GUF: [3.9339, -53.1258],
    PYF: [-17.6797, -149.4068], GAB: [-0.8037, 11.6094], GMB: [13.4432, -15.3101],
    GEO: [42.3154, 43.3569], DEU: [51.1657, 10.4515], GHA: [7.9465, -1.0232],
    GIB: [36.1408, -5.3536], GRC: [39.0742, 21.8243], GRL: [71.7069, -42.6043],
    GRD: [12.1165, -61.6790], GLP: [16.2650, -61.5510], GUM: [13.4443, 144.7937],
    GTM: [15.7835, -90.2308], GGY: [49.4657, -2.5853], GIN: [9.9456, -9.6966],
    GNB: [11.8037, -15.1804], GUY: [4.8604, -58.9302], HTI: [18.9712, -72.2852],
    HND: [15.2000, -86.2419], HKG: [22.3193, 114.1694], HUN: [47.1625, 19.5033],
    ISL: [64.9631, -19.0208], IND: [20.5937, 78.9629], IDN: [-0.7893, 113.9213],
    IRN: [32.4279, 53.6880], IRQ: [33.2232, 43.6793], IRL: [53.4129, -8.2439],
    IMN: [54.2361, -4.5481], ISR: [31.0461, 34.8516], ITA: [41.8719, 12.5674],
    JAM: [18.1096, -77.2975], JPN: [36.2048, 138.2529], JEY: [49.2144, -2.1313],
    JOR: [30.5852, 36.2384], KAZ: [48.0196, 66.9237], KEN: [-0.0236, 37.9062],
    KIR: [-3.3704, -168.7340], PRK: [40.3399, 127.5101], KOR: [35.9078, 127.7669],
    KWT: [29.3117, 47.4818], KGZ: [41.2044, 74.7661], LAO: [19.8563, 102.4955],
    LVA: [56.8796, 24.6032], LBN: [33.8547, 35.8623], LSO: [-29.6100, 28.2336],
    LBR: [6.4281, -9.4295], LBY: [26.3351, 17.2283], LIE: [47.1660, 9.5554],
    LTU: [55.1694, 23.8813], LUX: [49.8153, 6.1296], MAC: [22.1987, 113.5439],
    MDG: [-18.7669, 46.8691], MWI: [-13.2543, 34.3015], MYS: [4.2105, 101.9758],
    MDV: [3.2028, 73.2207], MLI: [17.5707, -3.9962], MLT: [35.9375, 14.3754],
    MHL: [7.1315, 171.1845], MTQ: [14.6415, -61.0242], MRT: [21.0079, -10.9408],
    MUS: [-20.3484, 57.5522], MYT: [-12.8275, 45.1662], MEX: [23.6345, -102.5528],
    FSM: [7.4256, 150.5508], MDA: [47.4116, 28.3699], MCO: [43.7384, 7.4246],
    MNG: [46.8625, 103.8467], MNE: [42.7087, 19.3744], MSR: [16.7425, -62.1874],
    MAR: [31.7917, -7.0926], MOZ: [-18.6657, 35.5296], MMR: [21.9162, 95.9560],
    NAM: [-22.9576, 18.4904], NRU: [-0.5228, 166.9315], NPL: [28.3949, 84.1240],
    NLD: [52.1326, 5.2913], NCL: [-20.9043, 165.6180], NZL: [-40.9006, 174.8860],
    NIC: [12.8654, -85.2072], NER: [17.6078, 8.0817], NGA: [9.0820, 8.6753],
    NIU: [-19.0544, -169.8672], MNP: [15.0979, 145.6739], NOR: [60.4720, 8.4689],
    OMN: [21.4735, 55.9754], PAK: [30.3753, 69.3451], PLW: [7.5149, 134.5825],
    PSE: [31.9522, 35.2332], PAN: [8.5380, -80.7821], PNG: [-6.3149, 143.9555],
    PRY: [-23.4425, -58.4438], PER: [-9.1900, -75.0152], PHL: [12.8797, 121.7740],
    PCN: [-24.7036, -127.4393], POL: [51.9194, 19.1451], PRT: [39.3999, -8.2245],
    PRI: [18.2208, -66.5901], QAT: [25.3548, 51.1839], MKD: [41.6086, 21.7453],
    ROU: [45.9432, 24.9668], RUS: [61.5240, 105.3188], RWA: [-1.9403, 29.8739],
    REU: [-21.1151, 55.5364], BLM: [17.9000, -62.8333], SHN: [-15.9650, -5.7089],
    KNA: [17.3578, -62.7830], LCA: [13.9094, -60.9789], MAF: [18.0708, -63.0501],
    SPM: [46.9419, -56.2711], VCT: [13.2528, -61.1971], WSM: [-13.7590, -172.1046],
    SMR: [43.9424, 12.4578], STP: [0.1864, 6.6131], SAU: [23.8859, 45.0792],
    SEN: [14.4974, -14.4524], SRB: [44.0165, 21.0059], SYC: [-4.6796, 55.4920],
    SLE: [8.4606, -11.7799], SGP: [1.3521, 103.8198], SXM: [18.0425, -63.0548],
    SVK: [48.6690, 19.6990], SVN: [46.1512, 14.9955], SLB: [-9.6457, 160.1562],
    SOM: [5.1521, 46.1996], ZAF: [-30.5595, 22.9375], KOR: [35.9078, 127.7669],
    SSD: [6.8769, 31.3069], ESP: [40.4637, -3.7492], LKA: [7.8731, 80.7718],
    SDN: [12.8628, 30.2176], SUR: [3.9193, -56.0278], SWE: [60.1282, 18.6435],
    CHE: [46.8182, 8.2275], SYR: [34.8021, 38.9968], TWN: [23.6978, 120.9605],
    TJK: [38.8610, 71.2761], TZA: [-6.3690, 34.8888], THA: [15.8700, 100.9925],
    TLS: [-8.8742, 125.7275], TGO: [8.6195, 0.8248], TON: [-21.1790, -175.1982],
    TTO: [10.6918, -61.2225], TUN: [33.8869, 9.5375], TUR: [38.9637, 35.2433],
    TKM: [38.9697, 59.5563], TCA: [21.6940, -71.7979], TUV: [-7.1095, 177.6493],
    UGA: [1.3733, 32.2903], UKR: [48.3794, 31.1656], ARE: [23.4241, 53.8478],
    GBR: [55.3781, -3.4360], USA: [39.8283, -98.5795], URY: [-32.5228, -55.7658],
    UZB: [41.3775, 64.5853], VUT: [-15.3767, 166.9592], VEN: [6.4238, -66.5897],
    VNM: [14.0583, 108.2772], WLF: [-14.2938, -178.1165], ESH: [24.2155, -12.8858],
    YEM: [15.5527, 48.5164], ZMB: [-13.1339, 27.8493], ZWE: [-19.0154, 29.1549],
    // 补充缺失的 ISO 代码
    AIA: [18.2206, -63.0686], // Anguilla
    CIV: [7.5400, -5.5471], // Côte d'Ivoire (Ivory Coast)
    TKL: [-9.2002, -171.8484], // Tokelau
    // Our World in Data 特殊代码
    OWID_CYN: [35.1264, 33.4299], // Northern Cyprus (使用塞浦路斯坐标)
    OWID_ENG: [52.3555, -1.1743], // England
    OWID_KOS: [42.6026, 20.9030], // Kosovo
    OWID_NIR: [54.5973, -5.9301], // Northern Ireland
    OWID_SCT: [56.4907, -4.2026], // Scotland
    OWID_WLS: [52.1307, -3.7837] // Wales
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
    createVaccinationDeathOverTimeChart();
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
    
    // 排序日期 - 使用所有日期
    const sortedDates = Array.from(allDates).sort();
    const displayDates = sortedDates; // 显示所有日期

    // 生成颜色（降低饱和度）
    const baseColors = [
        [54, 162, 235], [255, 99, 132], [75, 192, 192], 
        [255, 206, 86], [153, 102, 255], [255, 159, 64],
        [199, 199, 199], [83, 102, 255], [255, 99, 255], 
        [99, 255, 132], [255, 159, 64], [54, 162, 235],
        [255, 99, 132], [75, 192, 192], [255, 206, 86],
        [153, 102, 255], [255, 159, 64], [199, 199, 199],
        [83, 102, 255], [255, 99, 255]
    ];
    
    // 降低饱和度的函数：将颜色向灰色混合
    const desaturateColor = (r, g, b, factor = 0.5) => {
        const gray = (r + g + b) / 3;
        const newR = Math.round(r * (1 - factor) + gray * factor);
        const newG = Math.round(g * (1 - factor) + gray * factor);
        const newB = Math.round(b * (1 - factor) + gray * factor);
        return `rgb(${newR}, ${newG}, ${newB})`;
    };
    
    const colors = baseColors.map(([r, g, b]) => desaturateColor(r, g, b, 0.4));

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
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 20, // 如果日期太多，自动跳过一些标签
                        font: {
                            size: 9
                        }
                    }
                },
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

// 图表2: Vaccination and Death Over Time
function createVaccinationDeathOverTimeChart() {
    // 先按国家分组，收集所有日期
    const byCountry = {};
    const allDates = new Set();
    
    // 按国家分组
    filteredCountryData.forEach(item => {
        if (item.date && item.country) {
            const date = new Date(item.date).toISOString().split('T')[0];
            allDates.add(date);
            
            const country = item.country;
            if (!byCountry[country]) {
                byCountry[country] = {};
            }
            
            // 使用对象存储，以日期为key，方便查找
            if (!byCountry[country][date]) {
                byCountry[country][date] = {
                    vaccinations: null,
                    deaths: null
                };
            }
            
            // 如果有多条记录，取最大值
            if (item.total_vaccinations !== null && item.total_vaccinations !== undefined) {
                if (byCountry[country][date].vaccinations === null || 
                    item.total_vaccinations > byCountry[country][date].vaccinations) {
                    byCountry[country][date].vaccinations = item.total_vaccinations;
                }
            }
            
            if (item.Cumulative_deaths !== null && item.Cumulative_deaths !== undefined) {
                if (byCountry[country][date].deaths === null || 
                    item.Cumulative_deaths > byCountry[country][date].deaths) {
                    byCountry[country][date].deaths = item.Cumulative_deaths;
                }
            }
        }
    });
    
    // 对每个国家，为所有日期创建完整记录，缺失的日期使用前一天的累计值
    const processedCountryData = {};
    const sortedDates = Array.from(allDates).sort();
    
    Object.keys(byCountry).forEach(country => {
        const countryData = byCountry[country];
        const processed = [];
        
        let prevVaccinations = null;
        let prevDeaths = null;
        
        // 为每个日期创建记录
        sortedDates.forEach(date => {
            let vaccinations = countryData[date] ? countryData[date].vaccinations : null;
            let deaths = countryData[date] ? countryData[date].deaths : null;
            
            // 如果今天没有数据，使用昨天的累计值
            if (vaccinations === null && prevVaccinations !== null) {
                vaccinations = prevVaccinations;
            } else if (vaccinations !== null) {
                // 确保单调不减
                if (prevVaccinations !== null && vaccinations < prevVaccinations) {
                    vaccinations = prevVaccinations;
                }
                prevVaccinations = vaccinations;
            }
            
            if (deaths === null && prevDeaths !== null) {
                deaths = prevDeaths;
            } else if (deaths !== null) {
                // 确保单调不减
                if (prevDeaths !== null && deaths < prevDeaths) {
                    deaths = prevDeaths;
                }
                prevDeaths = deaths;
            }
            
            processed.push({
                date: date,
                vaccinations: vaccinations,
                deaths: deaths
            });
        });
        
        processedCountryData[country] = processed;
    });
    
    // 按日期汇总全球数据
    const dateData = {};
    
    sortedDates.forEach((date, dateIndex) => {
        let totalVaccinations = 0;
        let totalDeaths = 0;
        
        Object.keys(processedCountryData).forEach(country => {
            const record = processedCountryData[country][dateIndex];
            if (record && record.vaccinations !== null) {
                totalVaccinations += record.vaccinations;
            }
            if (record && record.deaths !== null) {
                totalDeaths += record.deaths;
            }
        });
        
        dateData[date] = {
            vaccinations: totalVaccinations > 0 ? totalVaccinations : null,
            deaths: totalDeaths > 0 ? totalDeaths : null
        };
    });
    
    // 准备数据
    const vaccinationData = sortedDates.map(date => {
        return dateData[date] ? dateData[date].vaccinations : null;
    });
    
    const deathData = sortedDates.map(date => {
        return dateData[date] ? dateData[date].deaths : null;
    });
    
    // 调试信息
    console.log('Vaccination and Death Over Time Chart Data:');
    console.log('Total dates:', sortedDates.length);
    console.log('Sample vaccination data:', vaccinationData.slice(0, 5));
    console.log('Sample death data:', deathData.slice(0, 5));
    
    if (chartInstances.vaccinationDeathOverTimeChart) {
        chartInstances.vaccinationDeathOverTimeChart.destroy();
    }
    
    const canvas = document.getElementById('vaccinationDeathOverTimeChart');
    if (!canvas) {
        console.error('Canvas element not found: vaccinationDeathOverTimeChart');
        return;
    }
    
    chartInstances.vaccinationDeathOverTimeChart = new Chart(document.getElementById('vaccinationDeathOverTimeChart'), {
        type: 'line',
        data: {
            labels: sortedDates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: 'Total Vaccinations',
                    data: vaccinationData,
                    borderColor: 'rgba(54, 162, 235, 0.8)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Total Deaths',
                    data: deathData,
                    borderColor: 'rgba(255, 99, 132, 0.8)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value === null) return context.dataset.label + ': No data';
                            
                            if (context.dataset.label === 'Total Vaccinations') {
                                return context.dataset.label + ': ' + (value / 1000000000).toFixed(2) + 'B';
                            } else {
                                return context.dataset.label + ': ' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 20,
                        font: {
                            size: 9
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Total Vaccinations'
                    },
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000000).toFixed(1) + 'B';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Total Deaths'
                    },
                    grid: {
                        drawOnChartArea: false
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
function createVaccinationDeathRelationChart(selectedDate = null) {
    // 如果没有指定日期，使用最新日期
    if (!selectedDate) {
        const allDates = new Set();
        filteredCountryData.forEach(item => {
            if (item.date) {
                allDates.add(new Date(item.date).toISOString().split('T')[0]);
            }
        });
        const sortedDates = Array.from(allDates).sort();
        selectedDate = sortedDates[sortedDates.length - 1];
    }
    
    // 按国家汇总指定日期及之前的数据
    const countryStats = {};
    
    filteredCountryData.forEach(item => {
        if (item.country && item.population && item.date) {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            
            // 只处理选定日期及之前的数据
            if (itemDate <= selectedDate) {
                if (!countryStats[item.country]) {
                    countryStats[item.country] = {
                        vaccinations: null,
                        cases: null,
                        population: item.population
                    };
                }
                
                // 更新到选定日期为止的最大值（累计值）
                if (item.people_fully_vaccinated !== null && item.people_fully_vaccinated !== undefined) {
                    if (countryStats[item.country].vaccinations === null || 
                        item.people_fully_vaccinated > countryStats[item.country].vaccinations) {
                        countryStats[item.country].vaccinations = item.people_fully_vaccinated;
                    }
                }
                
                if (item.Cumulative_cases !== null && item.Cumulative_cases !== undefined) {
                    if (countryStats[item.country].cases === null || 
                        item.Cumulative_cases > countryStats[item.country].cases) {
                        countryStats[item.country].cases = item.Cumulative_cases;
                    }
                }
            }
        }
    });

    // 转换为散点图数据，包含所有国家
    const allCountriesData = [];
    
    Object.entries(countryStats)
        .filter(([country, stats]) => {
            // 确保有数据和人口数据
            const hasData = stats.vaccinations !== null && stats.vaccinations > 0 && 
                          stats.cases !== null && stats.cases > 0 && 
                          stats.population > 0;
            if (!hasData) return false;
            
            // 计算疫苗接种率，如果 >= 100% 则不显示
            const vaccinationRate = stats.vaccinations / stats.population;
            return vaccinationRate < 1.0; // 小于100%
        })
        .forEach(([country, stats]) => {
            // 计算疫苗接种率（people_fully_vaccinated / population）
            const vaccinationRate = stats.vaccinations / stats.population;
            // 计算患病率（Cumulative_cases / population）
            const caseRate = stats.cases / stats.population;
            
            const point = {
                x: vaccinationRate,
                y: caseRate,
                country: country
            };
            allCountriesData.push(point);
        });
    
    console.log('图表数据点数量:', allCountriesData.length, '日期:', selectedDate);
    
    // 保存原始数据状态
    relationChartState.originalData = allCountriesData;
    relationChartState.originalDate = selectedDate;
    relationChartState.isCountryView = false;
    
    // 显示时间控件
    const dateInput = document.getElementById('relationChartDate');
    const dateSlider = document.getElementById('relationChartDateSlider');
    const dateDisplay = document.getElementById('relationChartDateDisplay');
    if (dateInput) dateInput.style.display = 'inline-block';
    if (dateSlider) dateSlider.style.display = 'inline-block';
    if (dateDisplay) dateDisplay.style.display = 'inline-block';
    
    // 隐藏恢复按钮
    const restoreBtn = document.getElementById('restoreRelationChartBtn');
    if (restoreBtn) {
        restoreBtn.style.display = 'none';
    }
    
    // 更新图表标题显示当前日期
    const chartTitle = document.querySelector('#vaccinationDeathRelationChart').closest('.chart-container').querySelector('.chart-title');
    if (chartTitle) {
        const dateStr = new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        chartTitle.innerHTML = `Correlation between Vaccination and Cases<br>(${dateStr})`;
    }

    if (chartInstances.vaccinationDeathRelationChart) {
        chartInstances.vaccinationDeathRelationChart.destroy();
    }

    chartInstances.vaccinationDeathRelationChart = new Chart(document.getElementById('vaccinationDeathRelationChart'), {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Countries',
                    data: allCountriesData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1.5,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            onClick: function(event, elements) {
                if (elements.length > 0) {
                    const clickedElement = elements[0];
                    const datasetIndex = clickedElement.datasetIndex;
                    const index = clickedElement.index;
                    const country = this.data.datasets[datasetIndex].data[index].country;
                    showCountryTimeSeries(country, selectedDate);
                }
            },
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
                                'Vaccination Rate: ' + (data.x * 100).toFixed(2) + '%',
                                'Case Rate: ' + (data.y * 100).toFixed(2) + '%',
                                'Click to view the time series of the country'
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Vaccination Rate (People Fully Vaccinated / Population)'
                    },
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(1) + '%';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Case Rate (Cumulative Cases / Population)'
                    },
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

// 显示单个国家的时间序列
function showCountryTimeSeries(country, selectedDate) {
    // 收集该国家所有日期的数据
    const countryTimeData = [];
    
    filteredCountryData.forEach(item => {
        if (item.country === country && item.date && item.population) {
            const vaccinations = item.people_fully_vaccinated !== null && item.people_fully_vaccinated !== undefined ? item.people_fully_vaccinated : null;
            const cases = item.Cumulative_cases !== null && item.Cumulative_cases !== undefined ? item.Cumulative_cases : null;
            
            if (vaccinations !== null && cases !== null && item.population > 0) {
                const vaccinationRate = vaccinations / item.population;
                
                // 只显示疫苗接种率 < 100% 的数据点
                if (vaccinationRate < 1.0) {
                    const date = new Date(item.date).toISOString().split('T')[0];
                    countryTimeData.push({
                        x: vaccinationRate,
                        y: cases, // 直接使用累计病例数
                        date: date,
                        country: country
                    });
                }
            }
        }
    });
    
    // 按日期排序
    countryTimeData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (countryTimeData.length === 0) {
        alert('该国家没有足够的数据');
        return;
    }
    
    // 更新状态
    relationChartState.isCountryView = true;
    relationChartState.selectedCountry = country;
    
    // 隐藏时间控件
    const dateInput = document.getElementById('relationChartDate');
    const dateSlider = document.getElementById('relationChartDateSlider');
    const dateDisplay = document.getElementById('relationChartDateDisplay');
    if (dateInput) dateInput.style.display = 'none';
    if (dateSlider) dateSlider.style.display = 'none';
    if (dateDisplay) dateDisplay.style.display = 'none';
    
    // 显示恢复按钮
    const restoreBtn = document.getElementById('restoreRelationChartBtn');
    if (restoreBtn) {
        restoreBtn.style.display = 'inline-block';
    }
    
    // 更新图表标题
    const chartTitle = document.querySelector('#vaccinationDeathRelationChart').closest('.chart-container').querySelector('.chart-title');
    if (chartTitle) {
        chartTitle.textContent = `4. ${country} - Vaccination Rate vs Cumulative Cases Over Time`;
    }
    
    // 销毁旧图表
    if (chartInstances.vaccinationDeathRelationChart) {
        chartInstances.vaccinationDeathRelationChart.destroy();
    }
    
    // 创建新的散点图，显示时间序列
    chartInstances.vaccinationDeathRelationChart = new Chart(document.getElementById('vaccinationDeathRelationChart'), {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: country,
                    data: countryTimeData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            onClick: function(event, elements) {
                // 在单国视图中，点击可以恢复
                restoreRelationChart();
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const data = context[0].raw;
                            return `${data.country} - ${new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
                        },
                        label: function(context) {
                            const data = context.raw;
                            return [
                                'Vaccination Rate: ' + (data.x * 100).toFixed(2) + '%',
                                'Cumulative Cases: ' + (data.y / 1000).toFixed(0) + 'K',
                                '点击恢复散点图'
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Vaccination Rate (People Fully Vaccinated / Population)'
                    },
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(1) + '%';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative Cases'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(0) + 'K';
                            }
                            return value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// 恢复散点图
function restoreRelationChart() {
    if (!relationChartState.isCountryView || !relationChartState.originalData) {
        return;
    }
    
    // 恢复状态
    relationChartState.isCountryView = false;
    relationChartState.selectedCountry = null;
    
    // 显示时间控件
    const dateInput = document.getElementById('relationChartDate');
    const dateSlider = document.getElementById('relationChartDateSlider');
    const dateDisplay = document.getElementById('relationChartDateDisplay');
    if (dateInput) dateInput.style.display = 'inline-block';
    if (dateSlider) dateSlider.style.display = 'inline-block';
    if (dateDisplay) dateDisplay.style.display = 'inline-block';
    
    // 隐藏恢复按钮
    const restoreBtn = document.getElementById('restoreRelationChartBtn');
    if (restoreBtn) {
        restoreBtn.style.display = 'none';
    }
    
    // 重新创建原始散点图
    createVaccinationDeathRelationChart(relationChartState.originalDate);
}

// 中国和印度子图
function createChinaIndiaSubChart() {
    // 按国家汇总最新数据
    const countryStats = {};
    
    filteredCountryData.forEach(item => {
        if (item.country && item.population) {
            if (!countryStats[item.country]) {
                countryStats[item.country] = {
                    vaccinations: 0,
                    cases: 0,
                    population: item.population
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
        }
    });

    // 只获取中国和印度的数据
    const chinaData = [];
    const indiaData = [];
    
    Object.entries(countryStats)
        .filter(([country, stats]) => {
            const isChinaOrIndia = country === 'China' || country === 'India';
            const hasData = stats.vaccinations > 0 && stats.cases > 0 && stats.population > 0;
            return isChinaOrIndia && hasData;
        })
        .forEach(([country, stats]) => {
            // 计算疫苗接种率（total_vaccinations / population）
            const vaccinationRate = stats.vaccinations / stats.population;
            // 使用累计病例数（Cumulative_cases）
            const cumulativeCases = stats.cases;
            
            const point = {
                x: vaccinationRate,
                y: cumulativeCases,
                country: country
            };
            
            if (country === 'China') {
                chinaData.push(point);
            } else if (country === 'India') {
                indiaData.push(point);
            }
        });

    if (chartInstances.chinaIndiaSubChart) {
        chartInstances.chinaIndiaSubChart.destroy();
    }

    chartInstances.chinaIndiaSubChart = new Chart(document.getElementById('chinaIndiaSubChart'), {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'China',
                    data: chinaData,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointRadius: 12,
                    pointHoverRadius: 14
                },
                {
                    label: 'India',
                    data: indiaData,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    pointRadius: 12,
                    pointHoverRadius: 14
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].raw.country;
                        },
                        label: function(context) {
                            const data = context.raw;
                            return [
                                'Vaccination Rate: ' + (data.x * 100).toFixed(2) + '%',
                                'Cumulative Cases: ' + (data.y / 1000).toFixed(0) + 'K'
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Vaccination Rate'
                    },
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(1) + '%';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative Cases'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(0) + 'K';
                            }
                            return value.toFixed(0);
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
    
    // 初始化关系图表的时间滑块
    initializeRelationChartSlider();
}

// 初始化关系图表的时间滑块
function initializeRelationChartSlider() {
    // 获取所有可用日期
    const allDates = new Set();
    countryData.forEach(item => {
        if (item.date) {
            allDates.add(new Date(item.date).toISOString().split('T')[0]);
        }
    });
    const sortedDates = Array.from(allDates).sort();
    
    if (sortedDates.length === 0) return;
    
    const minDate = sortedDates[0];
    const maxDate = sortedDates[sortedDates.length - 1];
    
    // 设置日期输入和滑块
    const dateInput = document.getElementById('relationChartDate');
    const dateSlider = document.getElementById('relationChartDateSlider');
    const dateDisplay = document.getElementById('relationChartDateDisplay');
    
    if (!dateInput || !dateSlider || !dateDisplay) return;
    
    dateInput.min = minDate;
    dateInput.max = maxDate;
    dateInput.value = maxDate;
    dateSlider.min = 0;
    dateSlider.max = sortedDates.length - 1;
    dateSlider.value = sortedDates.length - 1;
    dateDisplay.textContent = maxDate;
    
    // 存储日期数组供滑块使用
    window.relationChartDates = sortedDates;
    
    // 日期输入改变时更新滑块和图表
    dateInput.addEventListener('input', function() {
        const selectedDate = this.value;
        const index = sortedDates.indexOf(selectedDate);
        if (index !== -1) {
            dateSlider.value = index;
            dateDisplay.textContent = selectedDate;
            createVaccinationDeathRelationChart(selectedDate);
        }
    });
    
    // 滑块改变时更新日期输入和图表
    dateSlider.addEventListener('input', function() {
        const index = parseInt(this.value);
        const selectedDate = sortedDates[index];
        dateInput.value = selectedDate;
        dateDisplay.textContent = selectedDate;
        createVaccinationDeathRelationChart(selectedDate);
    });
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
    
    // 使用完整数据集（countryData），不受时间过滤限制，以便向前填充
    countryData.forEach(item => {
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
    const allDeaths = Object.values(dateData).map(d => d.deaths).filter(d => d > 0);
    const maxDeaths = Math.max(...allDeaths, 1);
    
    // 计算阈值：找出非常大的值（前5%或前10%）
    const sortedDeaths = [...allDeaths].sort((a, b) => b - a);
    const topThreshold = sortedDeaths.length > 0 
        ? sortedDeaths[Math.floor(sortedDeaths.length * 0.05)] // 前5%的阈值
        : maxDeaths * 0.9; // 如果没有足够数据，使用90%作为阈值

    // 为每个国家添加标记，并记录缺失坐标的 ISO 代码
    const missingIso = [];
    Object.entries(dateData).forEach(([isoCode, data]) => {
        const { country, deaths } = data;
        // 跳过死亡数为0的国家
        if (deaths === 0 || deaths === null || deaths === undefined) {
            return;
        }
        const coords = isoCodeCoordinates[isoCode];
        if (coords) {
            let color;
            
            if (deaths >= topThreshold) {
                // 非常大的值使用深红色
                color = 'rgb(139, 0, 0)'; // 深红色，突出显示非常大的值
            } else {
                // 其他值使用线性颜色映射（从浅粉色到红色）
                const intensity = deaths / topThreshold; // 相对于阈值归一化
                const clampedIntensity = Math.min(intensity, 1); // 限制在0-1之间
                
                // 线性映射：从浅粉色到红色
                const r = Math.floor(255 - clampedIntensity * 116); // 255 -> 139
                const g = Math.floor(240 - clampedIntensity * 240); // 240 -> 0
                const b = Math.floor(245 - clampedIntensity * 245); // 245 -> 0
                
                color = `rgb(${r}, ${g}, ${b})`;
            }
            
            // 计算标记大小：前5%和其他值使用不同的缩放策略
            let radius;
            if (deaths >= topThreshold) {
                // 前5%的大值：使用基于阈值的缩放
                const normalized = (deaths - topThreshold) / (maxDeaths - topThreshold); // 0到1之间
                const sizeRatio = Math.pow(normalized, 0.8); // 稍微压缩，让大值之间也有区别
                // 半径范围：20到30
                radius = 8 + sizeRatio * 3;
            } else {
                // 其他95%的值：使用更细致的缩放，让小值之间的差异更明显
                const normalized = deaths / topThreshold; // 相对于阈值的比例，0到1之间
                // 使用线性缩放，让小值之间的差异更明显
                // 不再使用平方根，直接使用线性映射
                // 半径范围：6到22，增大范围让差异更明显
                radius = 3 + normalized * 5;
            }
            
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
        } else if (!coords) {
            missingIso.push(isoCode);
        }
    });

    if (missingIso.length) {
        console.warn('缺少坐标的 ISO 代码（未显示在地图上）:', Array.from(new Set(missingIso)).sort());
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

