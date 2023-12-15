const getDateString = () => {
  const date = new Date()
  const strDate =
`${date.getFullYear()}.` +
`${date.getMonth() + 1}.` +
`${date.getDate()}-` +
`${date.getHours()}.` +
`${date.getMinutes()}.` +
`${date.getSeconds()}`

  return strDate
}

export { getDateString }
