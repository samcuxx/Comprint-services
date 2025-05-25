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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Monitor className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Comprint Services
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#services"
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105"
              >
                Services
              </Link>
              <Link
                href="#about"
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105"
              >
                Contact
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:scale-105 transition-transform duration-300"
                >
                  Staff Login
                </Button>
              </Link>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <Badge
                  variant="secondary"
                  className="w-fit bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-800 dark:text-blue-200 border-0"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Professional Computer Services
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                  Expert Computer
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Repair & Sales
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Professional computer repair services and quality computer
                  equipment sales. Fast, reliable, and affordable solutions for
                  all your technology needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#contact">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Service Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#services">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 transform hover:scale-105 transition-all duration-300"
                  >
                    View Services
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8 pt-6">
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    500+
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Repairs Completed
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                    24hr
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Turnaround Time
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                    5★
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Customer Rating
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in-delay">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative grid grid-cols-2 gap-6">
                <Card className="p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900/80 dark:to-blue-950/50 border-0 shadow-lg">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <Monitor className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">
                    Desktop Repair
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Complete desktop computer diagnostics and repair
                  </p>
                </Card>
                <Card className="p-6 mt-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900/80 dark:to-purple-950/50 border-0 shadow-lg">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <Laptop className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">
                    Laptop Service
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Professional laptop repair and maintenance
                  </p>
                </Card>
                <Card className="p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-green-50 dark:from-gray-900/80 dark:to-green-950/50 border-0 shadow-lg">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <ShoppingCart className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">
                    Parts & Sales
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quality computer parts and equipment
                  </p>
                </Card>
                <Card className="p-6 mt-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50 dark:from-gray-900/80 dark:to-orange-950/50 border-0 shadow-lg">
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                    <Settings className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-800 dark:text-blue-200 border-0"
            >
              <Star className="w-3 h-3 mr-1" />
              Our Services
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              Complete Technology Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From repairs to sales, we provide comprehensive computer services
              for individuals and businesses with cutting-edge expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900/80 dark:to-blue-950/30 border-0 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="p-0 mb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Computer Repair</CardTitle>
                <CardDescription className="text-base">
                  Expert diagnosis and repair of desktop and laptop computers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Hardware troubleshooting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Software installation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Virus removal</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Data recovery</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900/80 dark:to-purple-950/30 border-0 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 dark:from-purple-400/10 dark:to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="p-0 mb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">
                  Parts & Equipment
                </CardTitle>
                <CardDescription className="text-base">
                  Quality computer parts, accessories, and complete systems
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Computer components</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Accessories & peripherals</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Complete systems</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Custom builds</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900/80 dark:to-green-950/30 border-0 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 dark:from-green-400/10 dark:to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="p-0 mb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Wifi className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Network Setup</CardTitle>
                <CardDescription className="text-base">
                  Professional network installation and configuration services
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">WiFi setup</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Network security</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Router configuration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Troubleshooting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900/80 dark:to-orange-950/30 border-0 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 dark:from-orange-400/10 dark:to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="p-0 mb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <HardDrive className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Data Services</CardTitle>
                <CardDescription className="text-base">
                  Data backup, recovery, and migration services
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Data backup solutions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">File recovery</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">System migration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Cloud setup</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-900/80 dark:to-indigo-950/30 border-0 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="p-0 mb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Mobile Devices</CardTitle>
                <CardDescription className="text-base">
                  Smartphone and tablet repair and support services
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Screen replacement</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Battery replacement</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Software issues</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Data transfer</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-teal-50/50 dark:from-gray-900/80 dark:to-teal-950/30 border-0 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 dark:from-teal-400/10 dark:to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="p-0 mb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl mb-3">Business Support</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive IT support for small and medium businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">IT consulting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">System maintenance</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">Security solutions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-800 dark:text-blue-200 border-0"
            >
              <Award className="w-3 h-3 mr-1" />
              Why Choose Us
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              Professional & Reliable Service
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We combine technical expertise with exceptional customer service
              to deliver outstanding results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center space-y-6 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all duration-300">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Fast Turnaround</h3>
              <p className="text-muted-foreground leading-relaxed">
                Most repairs completed within 24-48 hours with priority service
                available
              </p>
            </div>

            <div className="group text-center space-y-6 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all duration-300">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Award className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Quality Guarantee</h3>
              <p className="text-muted-foreground leading-relaxed">
                All repairs backed by our comprehensive quality guarantee and
                warranty
              </p>
            </div>

            <div className="group text-center space-y-6 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all duration-300">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Expert Technicians</h3>
              <p className="text-muted-foreground leading-relaxed">
                Certified professionals with years of experience and ongoing
                training
              </p>
            </div>

            <div className="group text-center space-y-6 p-6 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all duration-300">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Cpu className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Latest Technology</h3>
              <p className="text-muted-foreground leading-relaxed">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-800 dark:text-blue-200 border-0"
            >
              <Phone className="w-3 h-3 mr-1" />
              Get In Touch
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              Contact Us Today
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ready to get your computer fixed or need new equipment? Reach out
              to us for expert assistance
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="group p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900/80 dark:to-blue-950/30 border-0 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-3">Phone</h3>
                <p className="text-muted-foreground text-lg mb-2">
                  +233 24-463-9827
                </p>
                <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM</p>
              </Card>

              <Card className="group p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900/80 dark:to-purple-950/30 border-0 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-3">Email</h3>
                <p className="text-muted-foreground text-lg mb-2">
                  boadiemmanuel@gmail.com
                </p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll respond within 24 hours
                </p>
              </Card>

              <Card className="group p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900/80 dark:to-green-950/30 border-0 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-3">Location</h3>
                <p className="text-muted-foreground text-lg mb-1">
                  SIC Bonpata Branch
                </p>
                <p className="text-muted-foreground">Kumasi - Ghana</p>
              </Card>
            </div>

            <Card className="p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-0 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-2xl mb-3">
                  Emergency Service
                </h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                  Need urgent computer repair? We offer emergency service for
                  critical business systems with 24/7 availability.
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <Phone className="mr-2 h-5 w-5" />
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
      <footer className="border-t bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Monitor className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Comprint Services
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Professional computer repair and sales services. Your trusted
                technology partner for all computing needs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Services</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Computer Repair
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Laptop Service
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Data Recovery
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Network Setup
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Products</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Computer Parts
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Accessories
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Complete Systems
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Software
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Contact</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors">
                  +233 24-463-9827
                </li>
                <li className="hover:text-primary transition-colors">
                  boadiemmanuel@gmail.com
                </li>
                <li>SIC Bonpata Branch</li>
                <li>Kumasi - Ghana</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center">
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
