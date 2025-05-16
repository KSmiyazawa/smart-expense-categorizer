import { Expense, columns, ExpenseTable } from '@/app/ExpenseTable'
 
async function getData(): Promise<Expense[]> {
  // Fetch data from your API here.
  return [
    {
      date: "2025-04-29",
      merchant: "Starbucks",
      amount: 1000,
      category: "Eating Out",
    },
  ]
}

export default async function Home() {
  const data = await getData()
 
  return (
    <div className="container mx-auto py-10">
      <ExpenseTable columns={columns} data={data} />
    </div>
  )
}
