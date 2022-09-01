import ApexCharts from 'react-apexcharts'
import { useState } from 'react'
import { ApexOptions } from 'apexcharts'

const DietChart = () => {
  const [series, setSeries] = useState<ApexAxisChartSeries>([
    {
      name: '덕구',
      data: [-1, -2, -3, -5],
    },
    {
      name: '지선',
      data: [-1, -1, -1, -1],
    },
  ])
  const options: ApexOptions = {
    chart: {
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
    },
    title: {
      text: 'Product Trends by Month',
      align: 'left',
    },
    grid: {
      row: {
        colors: ['#f3f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: ['1', '2', '3', '4', '5', '6', '7'],
    },
  }
  return <ApexCharts series={series} options={options} />
}

export default DietChart
