import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Wrench,
  ShoppingCart,
  Users,
  Clock,
  Shield,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Laptop,
  Smartphone,
  HardDrive,
  Cpu,
  Wifi,
  Settings,
  Zap,
  Award,
  TrendingUp,
  Menu,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Monitor className="w-8 h-8 text-primary" />
                <div className="absolute w-3 h-3 rounded-full -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
              </div>
              <span className="text-xl font-bold text-transparent bg-gradient-to-r from-primary to-blue-600 bg-clip-text">
                Comprint Services
              </span>
            </div>
            <div className="items-center hidden space-x-8 md:flex">
              <Link
                href="#services"
                className="transition-all duration-300 text-muted-foreground hover:text-primary hover:scale-105"
              >
                Services
              </Link>
              <Link
                href="#about"
                className="transition-all duration-300 text-muted-foreground hover:text-primary hover:scale-105"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="transition-all duration-300 text-muted-foreground hover:text-primary hover:scale-105"
              >
                Contact
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-transform duration-300 hover:scale-105"
                >
                  Staff Login
                </Button>
              </Link>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden lg:pt-32 lg:pb-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

        <div className="container relative px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <Badge
                  variant="secondary"
                  className="text-blue-800 border-0 w-fit bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-200"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Professional Computer Services
                </Badge>
                <h1 className="text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
                  Expert Computer
                  <span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text">
                    Repair & Sales
                  </span>
                </h1>
                <p className="max-w-lg text-xl leading-relaxed text-muted-foreground">
                  Professional computer repair services and quality computer
                  equipment sales. Fast, reliable, and affordable solutions for
                  all your technology needs.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="#contact">
                  <Button
                    size="lg"
                    className="w-full transition-all duration-300 transform shadow-lg sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl"
                  >
                    Get Service Quote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="#services">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full transition-all duration-300 transform sm:w-auto hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:scale-105"
                  >
                    View Services
                  </Button>
                </Link>
              </div>
              <div className="flex items-center pt-6 space-x-8">
                <div className="text-center group">
                  <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text">
                    500+
                  </div>
                  <div className="text-sm transition-colors text-muted-foreground group-hover:text-foreground">
                    Repairs Completed
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text">
                    24hr
                  </div>
                  <div className="text-sm transition-colors text-muted-foreground group-hover:text-foreground">
                    Turnaround Time
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400 bg-clip-text">
                    5★
                  </div>
                  <div className="text-sm transition-colors text-muted-foreground group-hover:text-foreground">
                    Customer Rating
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in-delay">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative grid grid-cols-2 gap-6">
                <Card className="p-6 transition-all duration-500 transform border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900/80 dark:to-blue-950/50">
                  <div className="flex items-center justify-center mb-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Monitor className="text-white h-7 w-7" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                    Desktop Repair
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Complete desktop computer diagnostics and repair
                  </p>
                </Card>
                <Card className="p-6 mt-8 transition-all duration-500 transform border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900/80 dark:to-purple-950/50">
                  <div className="flex items-center justify-center mb-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Laptop className="text-white h-7 w-7" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                    Laptop Service
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Professional laptop repair and maintenance
                  </p>
                </Card>
                <Card className="p-6 transition-all duration-500 transform border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-white to-green-50 dark:from-gray-900/80 dark:to-green-950/50">
                  <div className="flex items-center justify-center mb-4 w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                    <ShoppingCart className="text-white h-7 w-7" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                    Parts & Sales
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quality computer parts and equipment
                  </p>
                </Card>
                <Card className="p-6 mt-8 transition-all duration-500 transform border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50 dark:from-gray-900/80 dark:to-orange-950/50">
                  <div className="flex items-center justify-center mb-4 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <Settings className="text-white h-7 w-7" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                    Maintenance
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Regular maintenance and optimization
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-24 bg-gradient-to-b from-background to-muted/30"
      >
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-20 space-y-6 text-center">
            <Badge
              variant="secondary"
              className="text-blue-800 border-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-200"
            >
              <Star className="w-3 h-3 mr-1" />
              Our Services
            </Badge>
            <h2 className="text-4xl font-bold text-transparent lg:text-5xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text dark:from-white dark:to-gray-300">
              Complete Technology Solutions
            </h2>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-muted-foreground">
              From repairs to sales, we provide comprehensive computer services
              for individuals and businesses with cutting-edge expertise
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="relative p-8 overflow-hidden transition-all duration-500 transform border-0 shadow-lg group hover:shadow-2xl hover:-translate-y-3 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900/80 dark:to-blue-950/30">
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 group-hover:opacity-100"></div>
              <CardHeader className="relative z-10 p-0 mb-6">
                <div className="flex items-center justify-center w-16 h-16 mb-6 transition-transform duration-300 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl group-hover:scale-110">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="mb-3 text-xl">Computer Repair</CardTitle>
                <CardDescription className="text-base">
                  Expert diagnosis and repair of desktop and laptop computers
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 p-0">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Hardware troubleshooting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Software installation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Virus removal</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Data recovery</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative p-8 overflow-hidden transition-all duration-500 transform border-0 shadow-lg group hover:shadow-2xl hover:-translate-y-3 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900/80 dark:to-purple-950/30">
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 dark:from-purple-400/10 dark:to-pink-400/10 group-hover:opacity-100"></div>
              <CardHeader className="relative z-10 p-0 mb-6">
                <div className="flex items-center justify-center w-16 h-16 mb-6 transition-transform duration-300 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl group-hover:scale-110">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="mb-3 text-xl">
                  Parts & Equipment
                </CardTitle>
                <CardDescription className="text-base">
                  Quality computer parts, accessories, and complete systems
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 p-0">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Computer components</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Accessories & peripherals</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Complete systems</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Custom builds</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative p-8 overflow-hidden transition-all duration-500 transform border-0 shadow-lg group hover:shadow-2xl hover:-translate-y-3 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900/80 dark:to-green-950/30">
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 dark:from-green-400/10 dark:to-blue-400/10 group-hover:opacity-100"></div>
              <CardHeader className="relative z-10 p-0 mb-6">
                <div className="flex items-center justify-center w-16 h-16 mb-6 transition-transform duration-300 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl group-hover:scale-110">
                  <Wifi className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="mb-3 text-xl">Network Setup</CardTitle>
                <CardDescription className="text-base">
                  Professional network installation and configuration services
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 p-0">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">WiFi setup</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Network security</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Router configuration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Troubleshooting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative p-8 overflow-hidden transition-all duration-500 transform border-0 shadow-lg group hover:shadow-2xl hover:-translate-y-3 bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900/80 dark:to-orange-950/30">
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 dark:from-orange-400/10 dark:to-red-400/10 group-hover:opacity-100"></div>
              <CardHeader className="relative z-10 p-0 mb-6">
                <div className="flex items-center justify-center w-16 h-16 mb-6 transition-transform duration-300 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl group-hover:scale-110">
                  <HardDrive className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="mb-3 text-xl">Data Services</CardTitle>
                <CardDescription className="text-base">
                  Data backup, recovery, and migration services
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 p-0">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Data backup solutions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">File recovery</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">System migration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Cloud setup</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative p-8 overflow-hidden transition-all duration-500 transform border-0 shadow-lg group hover:shadow-2xl hover:-translate-y-3 bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-900/80 dark:to-indigo-950/30">
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-400/10 dark:to-purple-400/10 group-hover:opacity-100"></div>
              <CardHeader className="relative z-10 p-0 mb-6">
                <div className="flex items-center justify-center w-16 h-16 mb-6 transition-transform duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl group-hover:scale-110">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="mb-3 text-xl">Mobile Devices</CardTitle>
                <CardDescription className="text-base">
                  Smartphone and tablet repair and support services
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 p-0">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Screen replacement</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Battery replacement</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Software issues</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Data transfer</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative p-8 overflow-hidden transition-all duration-500 transform border-0 shadow-lg group hover:shadow-2xl hover:-translate-y-3 bg-gradient-to-br from-white to-teal-50/50 dark:from-gray-900/80 dark:to-teal-950/30">
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 dark:from-teal-400/10 dark:to-blue-400/10 group-hover:opacity-100"></div>
              <CardHeader className="relative z-10 p-0 mb-6">
                <div className="flex items-center justify-center w-16 h-16 mb-6 transition-transform duration-300 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl group-hover:scale-110">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="mb-3 text-xl">Business Support</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive IT support for small and medium businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 p-0">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">IT consulting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">System maintenance</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Security solutions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                    <span className="text-sm">Remote support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-20 space-y-6 text-center">
            <Badge
              variant="secondary"
              className="text-blue-800 border-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-200"
            >
              <Award className="w-3 h-3 mr-1" />
              Why Choose Us
            </Badge>
            <h2 className="text-4xl font-bold text-transparent lg:text-5xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text dark:from-white dark:to-gray-300">
              Professional & Reliable Service
            </h2>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-muted-foreground">
              We combine technical expertise with exceptional customer service
              to deliver outstanding results
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 space-y-6 text-center transition-all duration-300 group rounded-2xl hover:bg-white/50 dark:hover:bg-gray-900/50">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 mx-auto transition-transform duration-300 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl group-hover:scale-110">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <div className="absolute flex items-center justify-center w-6 h-6 rounded-full -top-2 -right-2 bg-gradient-to-r from-green-400 to-blue-500">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Fast Turnaround</h3>
              <p className="leading-relaxed text-muted-foreground">
                Most repairs completed within 24-48 hours with priority service
                available
              </p>
            </div>

            <div className="p-6 space-y-6 text-center transition-all duration-300 group rounded-2xl hover:bg-white/50 dark:hover:bg-gray-900/50">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 mx-auto transition-transform duration-300 shadow-lg bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl group-hover:scale-110">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute flex items-center justify-center w-6 h-6 rounded-full -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500">
                  <Award className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Quality Guarantee</h3>
              <p className="leading-relaxed text-muted-foreground">
                All repairs backed by our comprehensive quality guarantee and
                warranty
              </p>
            </div>

            <div className="p-6 space-y-6 text-center transition-all duration-300 group rounded-2xl hover:bg-white/50 dark:hover:bg-gray-900/50">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 mx-auto transition-transform duration-300 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl group-hover:scale-110">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <div className="absolute flex items-center justify-center w-6 h-6 rounded-full -top-2 -right-2 bg-gradient-to-r from-blue-400 to-purple-500">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Expert Technicians</h3>
              <p className="leading-relaxed text-muted-foreground">
                Certified professionals with years of experience and ongoing
                training
              </p>
            </div>

            <div className="p-6 space-y-6 text-center transition-all duration-300 group rounded-2xl hover:bg-white/50 dark:hover:bg-gray-900/50">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 mx-auto transition-transform duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl group-hover:scale-110">
                  <Cpu className="w-10 h-10 text-white" />
                </div>
                <div className="absolute flex items-center justify-center w-6 h-6 rounded-full -top-2 -right-2 bg-gradient-to-r from-green-400 to-teal-500">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Latest Technology</h3>
              <p className="leading-relaxed text-muted-foreground">
                Up-to-date with the latest technology trends and cutting-edge
                tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-24 bg-gradient-to-b from-background to-muted/30"
      >
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-20 space-y-6 text-center">
            <Badge
              variant="secondary"
              className="text-blue-800 border-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-200"
            >
              <Phone className="w-3 h-3 mr-1" />
              Get In Touch
            </Badge>
            <h2 className="text-4xl font-bold text-transparent lg:text-5xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text dark:from-white dark:to-gray-300">
              Contact Us Today
            </h2>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-muted-foreground">
              Ready to get your computer fixed or need new equipment? Reach out
              to us for expert assistance
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 mb-12 md:grid-cols-3">
              <Card className="p-8 text-center transition-all duration-500 transform border-0 shadow-lg group hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900/80 dark:to-blue-950/30">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 transition-transform duration-300 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl group-hover:scale-110">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Phone</h3>
                <p className="mb-2 text-lg text-muted-foreground">
                  +233 24-463-9827
                </p>
                <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM</p>
              </Card>

              <Card className="p-8 text-center transition-all duration-500 transform border-0 shadow-lg group hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900/80 dark:to-purple-950/30">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 transition-transform duration-300 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl group-hover:scale-110">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Email</h3>
                <p className="mb-2 text-lg text-muted-foreground">
                  boadiemmanuel@gmail.com
                </p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll respond within 24 hours
                </p>
              </Card>

              <Card className="p-8 text-center transition-all duration-500 transform border-0 shadow-lg group hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900/80 dark:to-green-950/30">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 transition-transform duration-300 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl group-hover:scale-110">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">Location</h3>
                <p className="mb-1 text-lg text-muted-foreground">
                  SIC Bonpata Branch
                </p>
                <p className="text-muted-foreground">Kumasi - Ghana</p>
              </Card>
            </div>

            <Card className="p-8 border-0 shadow-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold">
                  Emergency Service
                </h3>
                <p className="max-w-2xl mx-auto mb-6 text-lg text-muted-foreground">
                  Need urgent computer repair? We offer emergency service for
                  critical business systems with 24/7 availability.
                </p>
                <Button
                  size="lg"
                  className="transition-all duration-300 transform shadow-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-105"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Emergency Line
                  <br />
                  <span className="text-sm">0244639827</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid gap-8 mb-8 md:grid-cols-4">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Monitor className="w-8 h-8 text-primary" />
                  <div className="absolute w-3 h-3 rounded-full -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                </div>
                <span className="text-xl font-bold text-transparent bg-gradient-to-r from-primary to-blue-600 bg-clip-text">
                  Comprint Services
                </span>
              </div>
              <p className="leading-relaxed text-muted-foreground">
                Professional computer repair and sales services. Your trusted
                technology partner for all computing needs.
              </p>
            </div>
            <div>
              <h3 className="mb-6 text-lg font-semibold">Services</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="transition-colors cursor-pointer hover:text-primary">
                  Computer Repair
                </li>
                <li className="transition-colors cursor-pointer hover:text-primary">
                  Laptop Service
                </li>
                <li className="transition-colors cursor-pointer hover:text-primary">
                  Data Recovery
                </li>
                <li className="transition-colors cursor-pointer hover:text-primary">
                  Network Setup
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-6 text-lg font-semibold">Products</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="transition-colors cursor-pointer hover:text-primary">
                  Computer Parts
                </li>
                <li className="transition-colors cursor-pointer hover:text-primary">
                  Accessories
                </li>
                <li className="transition-colors cursor-pointer hover:text-primary">
                  Complete Systems
                </li>
                <li className="transition-colors cursor-pointer hover:text-primary">
                  Software
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-6 text-lg font-semibold">Contact</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="transition-colors hover:text-primary">
                  +233 24-463-9827
                </li>
                <li className="transition-colors hover:text-primary">
                  boadiemmanuel@gmail.com
                </li>
                <li>SIC Bonpata Branch</li>
                <li>Kumasi - Ghana</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center border-t">
            <p className="text-muted-foreground">
              &copy; {new Date().getFullYear()} Comprint Services. All rights
              reserved. | Built with ❤️ for technology excellence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
