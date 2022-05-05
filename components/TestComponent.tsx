import { useState } from 'react'

const TestComponent = () => {
  const [testText, setTestText] = useState<string>()

  const changeHandler = (e: React.FormEvent<HTMLInputElement>) => {
    const currentText = e.currentTarget.value
    setTestText(currentText)
  }

  return (
    <>
      <input
        type="text"
        placeholder="테스트 해주세요~~"
        onChange={changeHandler}
        className="block w-full mb-3 px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-md dark:border-gray-900 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-gray-100"
      />
      당신이 작성한 것 : {testText}
    </>
  )
}

export default TestComponent
