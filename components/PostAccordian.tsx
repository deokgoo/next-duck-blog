import { Fragment, ReactNode, useState } from 'react'
import { Accordion, AccordionHeader, AccordionBody } from '@material-tailwind/react'

interface Props {
  title: string
  children: ReactNode
}

const PostAccordian = ({ title, children }: Props) => {
  const [open, setOpen] = useState(0)

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value)
  }

  return (
    <Fragment>
      <Accordion open={open === 1} onClick={() => handleOpen(1)}>
        <AccordionHeader>{title}</AccordionHeader>
        <AccordionBody>{children}</AccordionBody>
      </Accordion>
    </Fragment>
  )
}

export default PostAccordian
