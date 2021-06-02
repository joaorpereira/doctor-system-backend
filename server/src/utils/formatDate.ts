import { eachMinuteOfInterval, addMinutes } from 'date-fns'

export const DURATION_TIME = 30

export const timeConvert = (num: number, duration: number = 30) => {
  const hours = Math.floor(num / 60)
  const minutes = num % 60
  return `${hours}:${minutes !== duration ? '00' : minutes}`
}

export const convertHourToMinutes = (date: Date) => {
  const hour = date.getHours()
  const minutes = date.getMinutes()
  return minutes + hour * 60
}

export const getIntervalByMinutes = (
  startDate: Date,
  endDate: Date,
  totalMinutes?: number
) => {
  return eachMinuteOfInterval(
    {
      start: new Date(startDate),
      end: totalMinutes
        ? addMinutes(new Date(endDate), totalMinutes)
        : new Date(endDate),
    },
    { step: 30 }
  )
}

export const splitByValue = (array : string[], value: string) => {
  let newArray: any = [[]]
  array.forEach((element: string) => {
    if (element !== value) {
      newArray[newArray.length - 1].push(element)
    } else {
      newArray.push([])
    }
  })
  return newArray
}
