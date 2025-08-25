"use client"

import { useSignIn, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, School, MapPin } from "lucide-react"

// School data with their branches
const schools = [
  {
    id: 'dps',
    name: 'Delhi Public School',
    branches: [
      { id: 'main', name: 'Main Campus' },
      { id: 'north', name: 'North Campus' },
      { id: 'south', name: 'South Campus' },
      { id: 'east', name: 'East Campus' },
      { id: 'west', name: 'West Campus' },
    ]
  },
  {
    id: 'kvs',
    name: 'Kendriya Vidyalaya',
    branches: [
      { id: 'central', name: 'Central Branch' },
      { id: 'cantonment', name: 'Cantonment Branch' },
      { id: 'airport', name: 'Airport Branch' },
    ]
  },
  {
    id: 'sps',
    name: 'St. Paul\'s School',
    branches: [
      { id: 'primary', name: 'Primary Wing' },
      { id: 'secondary', name: 'Secondary Wing' },
      { id: 'senior', name: 'Senior Wing' },
    ]
  },
  {
    id: 'ris',
    name: 'Ryan International School',
    branches: [
      { id: 'main', name: 'Main Branch' },
      { id: 'extension', name: 'Extension Branch' },
    ]
  },
]

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const { user } = useUser()
  const router = useRouter()
  
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [availableBranches, setAvailableBranches] = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If user is already signed in, redirect to admin
  useEffect(() => {
    if (user) {
      router.push('/admin')
    }
  }, [user, router])

  // Update available branches when school changes
  useEffect(() => {
    const school = schools.find(s => s.id === selectedSchool)
    if (school) {
      setAvailableBranches(school.branches)
      // Reset branch selection when school changes
      setSelectedBranch('')
    } else {
      setAvailableBranches([])
    }
  }, [selectedSchool])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) {
      return
    }

    if (!selectedSchool || !selectedBranch) {
      setError('Please select both school and branch')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create composite branch ID (e.g., "dps-main", "kvs-central")
      const compositeBranchId = `${selectedSchool}-${selectedBranch}`
      
      // Store the composite branch ID and school/branch info
      localStorage.setItem('selectedBranchId', compositeBranchId)
      localStorage.setItem('selectedSchoolId', selectedSchool)
      localStorage.setItem('selectedBranchName', selectedBranch)
      
      const school = schools.find(s => s.id === selectedSchool)
      const branch = school?.branches.find(b => b.id === selectedBranch)
      
      if (school && branch) {
        localStorage.setItem('selectedSchoolName', school.name)
        localStorage.setItem('selectedBranchDisplayName', branch.name)
      }
      
      // Sign in with Clerk
      const result = await signIn.create({
        identifier: username,
        password: password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/admin')
      } else {
        setError('Sign in failed. Please check your credentials.')
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      setError(err.errors?.[0]?.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Paramarsh SMS</CardTitle>
            <CardDescription className="text-center">
              School Management System
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* School Selection */}
              <div className="space-y-2">
                <Label htmlFor="school" className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  School
                </Label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Select your school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Selection - Only show if school is selected */}
              {selectedSchool && (
                <div className="space-y-2">
                  <Label htmlFor="branch" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Branch
                  </Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !isLoaded}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Test Credentials Info for Development */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-blue-900 mb-2">Test Credentials:</p>
            <div className="space-y-2 text-xs">
              <div className="text-blue-800">
                <strong className="text-blue-900">Admin:</strong>
                <div className="ml-4">Username: admin</div>
                <div className="ml-4">Password: Admin@123</div>
              </div>
              <div className="text-blue-800">
                <strong className="text-blue-900">Teacher:</strong>
                <div className="ml-4">Username: teacher</div>
                <div className="ml-4">Password: Teacher@123</div>
              </div>
              <div className="text-blue-800">
                <strong className="text-blue-900">Student:</strong>
                <div className="ml-4">Username: student</div>
                <div className="ml-4">Password: Student@123</div>
              </div>
              <div className="text-blue-800">
                <strong className="text-blue-900">Parent:</strong>
                <div className="ml-4">Username: parent</div>
                <div className="ml-4">Password: Parent@123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}