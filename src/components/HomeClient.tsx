"use client"

import { useState } from "react"
import { Expense, columns, ExpenseTable } from "@/components/ExpenseTable"
import ReceiptUpload from "../components/ReceiptUpload";

export default function HomeClient() {

  const [data, setData] = useState<Expense[]>([]);
  const handleParsedData = (newExpense: Expense) => {
    setData((prev) => [...prev, newExpense]);
  }

  return (
    <div className="container mx-auto py-10">
      <ReceiptUpload handleParsedData={handleParsedData} />
      <ExpenseTable columns={columns} data={data} />
    </div>
  )
}