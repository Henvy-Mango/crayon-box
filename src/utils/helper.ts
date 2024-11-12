import dayjs from 'dayjs'
import { Client } from '~/utils/client'

export function formatNumber(input: string | number) {
    const num = Number(input)

    if (num > 100) {
        return num.toFixed(2).toString()
    } else if (num < 100 && num > 10) {
        return num.toFixed(4).toString()
    } else {
        return num.toString()
    }
}

export function isTradingHours() {
    const startTime = dayjs().hour(9)
    const endTime = dayjs().hour(15).minute(30)

    return dayjs().isBefore(endTime) && dayjs().isAfter(startTime)
}

export async function isTradingDay() {
    function isWeekends() {
        const dayOfWeek = dayjsObj.day()
        return dayOfWeek === 0 || dayOfWeek === 6
    }

    async function isHoliday() {
        let result
        try {
            result = await new Client(
                'https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/'
            ).getRequset<any>(`${dayjsObj.year()}.json`)
        } catch (error) {
            console.error(error)
            return false
        }

        return result.days
            .filter((o: any) => o.isOffDay)
            .map((o: any) => o.date)
            .includes(dayjsObj.format('YYYY-MM-DD'))
    }

    const dayjsObj = dayjs()
    return !isWeekends() && !(await isHoliday())
}
