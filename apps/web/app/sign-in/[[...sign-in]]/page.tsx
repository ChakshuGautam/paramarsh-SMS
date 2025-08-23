"use client"

import { SignIn } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const branches = [
  { id: 'branch1', name: 'Main Campus' },
  { id: 'branch2', name: 'North Campus' },
  { id: 'branch3', name: 'South Campus' },
  { id: 'branch4', name: 'East Campus' },
  { id: 'branch5', name: 'West Campus' },
]

export default function SignInPage() {
  const [selectedBranch, setSelectedBranch] = useState('branch1')

  useEffect(() => {
    // Store the selected branch in localStorage for use after sign-in
    localStorage.setItem('selectedBranchId', selectedBranch)
  }, [selectedBranch])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramarsh SMS</CardTitle>
            <CardDescription>School Management System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Select Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none p-0",
                },
              }}
              redirectUrl="/admin"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}