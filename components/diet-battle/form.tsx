import { ChangeEvent, useState } from 'react'
import { existName } from './api/registerBattle'

type FormStatus = 'success' | 'fail' | 'default'

const DietBattleForm = () => {
  const [name, setName] = useState<string>()
  const [formStatus, setFormStatus] = useState<FormStatus>('default')

  const nameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value)
    if (formStatus !== 'default') {
      setFormStatus('default')
    }
  }
  const submitHandler = async () => {
    try {
      await existName(name)
      setFormStatus('success')
    } catch {
      setFormStatus('fail')
      console.warn('invalid name')
    }
  }

  const successStyle = `bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500`
  const failStyle = `bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500`
  const defaultStyle = `border text-sm rounded-lg dark:bg-gray-700 block w-full p-2.5`

  return (
    <>
      <div className="newLocal">
        <label htmlFor="name" className="block mb-2 text-sm font-medium">
          Your name
        </label>
        <input
          type="text"
          id="name"
          className={`${formStatus === 'success' ? successStyle : ''} ${
            formStatus === 'fail' ? failStyle : ''
          } ${formStatus === 'default' ? defaultStyle : ''}
          }`}
          placeholder="insert your name"
          value={name}
          onChange={nameChangeHandler}
          disabled={formStatus === 'success'}
        />
        {formStatus === 'success' && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-500">존재하는 계정입니다.</p>
        )}

        {formStatus === 'fail' && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            관리자에게 문의해주시기 바랍니다.
          </p>
        )}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3"
          style={{ width: '100px', fontSize: '18px' }}
          onClick={submitHandler}
        >
          Submit
        </button>
      </div>
    </>
  )
}

export default DietBattleForm
