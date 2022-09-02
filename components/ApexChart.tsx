import ApexCharts from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

const DietChart = ({ dietDate }: any) => {
  const filterDate = () => {
    if (!dietDate) return
    if (dietDate?.keys?.length === 0) return []
    console.log(dietDate)
    return Object.keys(dietDate).map((x) => {
      return {
        name: x === 'deokgoo' ? '덕구' : '지선',
        // @ts-ignore
        data: dietDate[x].filter((y) => y).map((y) => y.todayWeight),
      }
    })
  }
  const options: ApexOptions = {
    chart: {
      height: '1500',
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
      text: '다이어트 대결',
      align: 'left',
    },
    grid: {
      row: {
        colors: ['#f3f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '30',
      ],
    },
  }
  return <ApexCharts series={filterDate()} options={options} />
}

export default DietChart
