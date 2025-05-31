"use client"

import { useState } from "react"
import { AlertTriangle, Check, ChevronDown, Eye, Filter, ImageIcon, Keyboard, Layers, List, Search, SlidersHorizontal, Tag, X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import AccountSidebar from "@/components/ui/AccountSidebar"
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset
} from "@/components/ui/sidebar"

// Define issue categories with their icons
const categoryIcons = {
  contrast: <Eye className="h-4 w-4" />,
  "alt-text": <ImageIcon className="h-4 w-4" />,
  "keyboard-nav": <Keyboard className="h-4 w-4" />,
  "form-labels": <Tag className="h-4 w-4" />
}

// Define severity levels with their colors
const severityColors = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  serious: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  minor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
}

// Sample accessibility issues data
const accessibilityIssues = [
  {
    id: 1,
    category: "contrast",
    description: "Insufficient color contrast between text and background",
    element: "<button class='btn-primary'>Submit</button>",
    status: "not-fixed",
    severity: "critical",
    page: "/contact"
  },
  {
    id: 2,
    category: "alt-text",
    description: "Missing alt text on image",
    element: "<img src='/logo.png'>",
    status: "fixed",
    severity: "serious",
    page: "/home"
  },
  {
    id: 3,
    category: "keyboard-nav",
    description: "Interactive element not keyboard accessible",
    element: "<div onclick='toggleMenu()'>Menu</div>",
    status: "not-fixed",
    severity: "critical",
    page: "/products"
  },
  {
    id: 4,
    category: "form-labels",
    description: "Form input missing associated label",
    element: "<input type='text' name='email'>",
    status: "not-fixed",
    severity: "moderate",
    page: "/signup"
  },
  {
    id: 5,
    category: "contrast",
    description: "Low contrast on hover state",
    element: "<a class='nav-link' href='/about'>About</a>",
    status: "not-fixed",
    severity: "minor",
    page: "/about"
  },
  {
    id: 6,
    category: "keyboard-nav",
    description: "Focus indicator not visible",
    element: "<button class='action-btn'>Download</button>",
    status: "fixed",
    severity: "serious",
    page: "/resources"
  },
  {
    id: 7,
    category: "alt-text",
    description: "Decorative image with unnecessary alt text",
    element: "<img src='/divider.png' alt='decorative divider'>",
    status: "not-fixed",
    severity: "minor",
    page: "/blog"
  },
  {
    id: 8,
    category: "form-labels",
    description: "Label not programmatically associated with input",
    element: "<label>Name</label><input type='text'>",
    status: "fixed",
    severity: "moderate",
    page: "/contact"
  }
]

export default function AccessibilityDashboard() {
  // State for filters and view options
  const [view, setView] = useState<"list" | "card">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [severityFilter, setSeverityFilter] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("severity")
  const [selectedMenu, setSelectedMenu] = useState<"overview" | "account">("overview");
  
  // Function to toggle issue status
  const toggleIssueStatus = (id: number) => {
    // In a real app, this would update the database
    console.log(`Toggling status for issue #${id}`)
  }
  
  // Filter and sort issues based on current filters
  const filteredIssues = accessibilityIssues.filter(issue => {
    // Apply search filter
    if (searchQuery && !issue.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !issue.element.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Apply status filter
    if (statusFilter.length > 0 && !statusFilter.includes(issue.status)) {
      return false
    }
    
    // Apply category filter
    if (categoryFilter.length > 0 && !categoryFilter.includes(issue.category)) {
      return false
    }
    
    // Apply severity filter
    if (severityFilter.length > 0 && !severityFilter.includes(issue.severity)) {
      return false
    }
    
    return true
  }).sort((a, b) => {
    // Sort based on selected sort option
    if (sortBy === "severity") {
      const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 }
      return severityOrder[a.severity as keyof typeof severityOrder] - 
             severityOrder[b.severity as keyof typeof severityOrder]
    } else if (sortBy === "category") {
      return a.category.localeCompare(b.category)
    } else if (sortBy === "status") {
      return a.status.localeCompare(b.status)
    } else {
      return a.id - b.id
    }
  })
  
  // Count issues by category and status
  const issueStats = {
    total: accessibilityIssues.length,
    fixed: accessibilityIssues.filter(issue => issue.status === "fixed").length,
    notFixed: accessibilityIssues.filter(issue => issue.status === "not-fixed").length,
    contrast: accessibilityIssues.filter(issue => issue.category === "contrast").length,
    altText: accessibilityIssues.filter(issue => issue.category === "alt-text").length,
    keyboardNav: accessibilityIssues.filter(issue => issue.category === "keyboard-nav").length,
    formLabels: accessibilityIssues.filter(issue => issue.category === "form-labels").length,
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-4 py-2">
              <AlertTriangle className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Accessibility Audit</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={selectedMenu === "overview"}
                      onClick={() => setSelectedMenu("overview")}
                    >
                      <Layers className="h-4 w-4" />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={selectedMenu === "account"}
                      onClick={() => setSelectedMenu("account")}
                    >
                      <Tag className="h-4 w-4" />
                      <span>Account / Subscription</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Categories</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Eye className="h-4 w-4" />
                      <span>Contrast Issues</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <ImageIcon className="h-4 w-4" />
                      <span>Alt Text Issues</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Keyboard className="h-4 w-4" />
                      <span>Keyboard Navigation</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Tag className="h-4 w-4" />
                      <span>Form Label Issues</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Pages</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Array.from(new Set(accessibilityIssues.map(issue => issue.page))).map(page => (
                    <SidebarMenuItem key={page}>
                      <SidebarMenuButton>
                        <span>{page}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              Last scan: May 3, 2025
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <div className="flex-1 space-y-4 p-4 md:p-8">
            {selectedMenu === "overview" ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold tracking-tight">Accessibility Audit Results</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Run New Scan
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="overview" className="space-y-4">
                  <div className="flex justify-between">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="issues">All Issues</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={view === "list" ? "bg-muted" : ""}
                        onClick={() => setView("list")}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={view === "card" ? "bg-muted" : ""}
                        onClick={() => setView("card")}
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{issueStats.total}</div>
                          <p className="text-xs text-muted-foreground">
                            {issueStats.fixed} fixed, {issueStats.notFixed} to fix
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Contrast Issues</CardTitle>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{issueStats.contrast}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Alt Text Issues</CardTitle>
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{issueStats.altText}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Keyboard Navigation</CardTitle>
                          <Keyboard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{issueStats.keyboardNav}</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Issues</CardTitle>
                        <CardDescription>
                          The most recent accessibility issues detected
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {accessibilityIssues.slice(0, 5).map(issue => (
                            <div key={issue.id} className="flex items-start gap-4 rounded-lg border p-4">
                              <div className="mt-0.5">
                                {issue.category === "contrast" && <Eye className="h-5 w-5 text-muted-foreground" />}
                                {issue.category === "alt-text" && <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                                {issue.category === "keyboard-nav" && <Keyboard className="h-5 w-5 text-muted-foreground" />}
                                {issue.category === "form-labels" && <Tag className="h-5 w-5 text-muted-foreground" />}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={severityColors[issue.severity as keyof typeof severityColors]}>
                                    {issue.severity}
                                  </Badge>
                                  <Badge variant="outline">
                                    {issue.category.replace("-", " ")}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground ml-auto">
                                    {issue.page}
                                  </div>
                                </div>
                                <p className="text-sm font-medium">{issue.description}</p>
                                <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                                  {issue.element}
                                </pre>
                              </div>
                              <div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={issue.status === "fixed" ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900" : ""}
                                  onClick={() => toggleIssueStatus(issue.id)}
                                >
                                  {issue.status === "fixed" ? (
                                    <>
                                      <Check className="mr-1 h-3 w-3" />
                                      Fixed
                                    </>
                                  ) : (
                                    "Mark Fixed"
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="issues" className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1 md:max-w-sm">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search issues..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Filter className="mr-2 h-4 w-4" />
                              Filter
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                              checked={statusFilter.includes("fixed")}
                              onCheckedChange={(checked) => {
                                setStatusFilter(
                                  checked 
                                    ? [...statusFilter, "fixed"] 
                                    : statusFilter.filter(s => s !== "fixed")
                                )
                              }}
                            >
                              Fixed
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={statusFilter.includes("not-fixed")}
                              onCheckedChange={(checked) => {
                                setStatusFilter(
                                  checked 
                                    ? [...statusFilter, "not-fixed"] 
                                    : statusFilter.filter(s => s !== "not-fixed")
                                )
                              }}
                            >
                              Not Fixed
                            </DropdownMenuCheckboxItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                              checked={categoryFilter.includes("contrast")}
                              onCheckedChange={(checked) => {
                                setCategoryFilter(
                                  checked 
                                    ? [...categoryFilter, "contrast"] 
                                    : categoryFilter.filter(c => c !== "contrast")
                                )
                              }}
                            >
                              Contrast
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={categoryFilter.includes("alt-text")}
                              onCheckedChange={(checked) => {
                                setCategoryFilter(
                                  checked 
                                    ? [...categoryFilter, "alt-text"] 
                                    : categoryFilter.filter(c => c !== "alt-text")
                                )
                              }}
                            >
                              Alt Text
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={categoryFilter.includes("keyboard-nav")}
                              onCheckedChange={(checked) => {
                                setCategoryFilter(
                                  checked 
                                    ? [...categoryFilter, "keyboard-nav"] 
                                    : categoryFilter.filter(c => c !== "keyboard-nav")
                                )
                              }}
                            >
                              Keyboard Navigation
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={categoryFilter.includes("form-labels")}
                              onCheckedChange={(checked) => {
                                setCategoryFilter(
                                  checked 
                                    ? [...categoryFilter, "form-labels"] 
                                    : categoryFilter.filter(c => c !== "form-labels")
                                )
                              }}
                            >
                              Form Labels
                            </DropdownMenuCheckboxItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                              checked={severityFilter.includes("critical")}
                              onCheckedChange={(checked) => {
                                setSeverityFilter(
                                  checked 
                                    ? [...severityFilter, "critical"] 
                                    : severityFilter.filter(s => s !== "critical")
                                )
                              }}
                            >
                              Critical
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={severityFilter.includes("serious")}
                              onCheckedChange={(checked) => {
                                setSeverityFilter(
                                  checked 
                                    ? [...severityFilter, "serious"] 
                                    : severityFilter.filter(s => s !== "serious")
                                )
                              }}
                            >
                              Serious
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={severityFilter.includes("moderate")}
                              onCheckedChange={(checked) => {
                                setSeverityFilter(
                                  checked 
                                    ? [...severityFilter, "moderate"] 
                                    : severityFilter.filter(s => s !== "moderate")
                                )
                              }}
                            >
                              Moderate
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={severityFilter.includes("minor")}
                              onCheckedChange={(checked) => {
                                setSeverityFilter(
                                  checked 
                                    ? [...severityFilter, "minor"] 
                                    : severityFilter.filter(s => s !== "minor")
                                )
                              }}
                            >
                              Minor
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-[180px]">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="severity">Sort by Severity</SelectItem>
                            <SelectItem value="category">Sort by Category</SelectItem>
                            <SelectItem value="status">Sort by Status</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          {filteredIssues.length} issues found
                        </div>
                        
                        <Button variant="outline" size="sm" onClick={() => {
                          setSearchQuery("")
                          setStatusFilter([])
                          setCategoryFilter([])
                          setSeverityFilter([])
                        }}>
                          <X className="mr-2 h-4 w-4" />
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                    
                    {view === "list" ? (
                      <div className="space-y-2">
                        {filteredIssues.map(issue => (
                          <div key={issue.id} className="flex items-start gap-4 rounded-lg border p-4">
                            <div className="mt-0.5">
                              {categoryIcons[issue.category as keyof typeof categoryIcons]}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={severityColors[issue.severity as keyof typeof severityColors]}>
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline">
                                  {issue.category.replace("-", " ")}
                                </Badge>
                                <div className="text-xs text-muted-foreground ml-auto">
                                  {issue.page}
                                </div>
                              </div>
                              <p className="text-sm font-medium">{issue.description}</p>
                              <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                                {issue.element}
                              </pre>
                            </div>
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                className={issue.status === "fixed" ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900" : ""}
                                onClick={() => toggleIssueStatus(issue.id)}
                              >
                                {issue.status === "fixed" ? (
                                  <>
                                    <Check className="mr-1 h-3 w-3" />
                                    Fixed
                                  </>
                                ) : (
                                  "Mark Fixed"
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredIssues.map(issue => (
                          <Card key={issue.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {categoryIcons[issue.category as keyof typeof categoryIcons]}
                                  <CardTitle className="text-sm font-medium">
                                    {issue.category.replace("-", " ")}
                                  </CardTitle>
                                </div>
                                <Badge variant="outline" className={severityColors[issue.severity as keyof typeof severityColors]}>
                                  {issue.severity}
                                </Badge>
                              </div>
                              <CardDescription className="mt-2">
                                {issue.page}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <p className="text-sm">{issue.description}</p>
                              <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                                {issue.element}
                              </pre>
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center">
                                  <Checkbox 
                                    id={`fixed-${issue.id}`} 
                                    checked={issue.status === "fixed"}
                                    onCheckedChange={() => toggleIssueStatus(issue.id)}
                                  />
                                  <label 
                                    htmlFor={`fixed-${issue.id}`}
                                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Mark as fixed
                                  </label>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Issue #{issue.id}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <AccountSidebar />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}