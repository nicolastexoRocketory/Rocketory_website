import type { GlobalAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateHomepageAfterChange: GlobalAfterChangeHook = ({ doc }) => {
  revalidatePath('/')
  return doc
}
