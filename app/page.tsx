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
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Comprint Services</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#services"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Services
              </Link>
              <Link
                href="#about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Staff Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Professional Computer Services
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Expert Computer
                  <span className="text-primary"> Repair & Sales</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Professional computer repair services and quality computer
                  equipment sales. Fast, reliable, and affordable solutions for
                  all your technology needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#contact">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Service Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#services">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    View Services
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-muted-foreground">
                    Repairs Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24hr</div>
                  <div className="text-sm text-muted-foreground">
                    Turnaround Time
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5★</div>
                  <div className="text-sm text-muted-foreground">
                    Customer Rating
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6">
                  <Monitor className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Desktop Repair</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete desktop computer diagnostics and repair
                  </p>
                </Card>
                <Card className="p-6 mt-8">
                  <Laptop className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Laptop Service</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional laptop repair and maintenance
                  </p>
                </Card>
                <Card className="p-6">
                  <ShoppingCart className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Parts & Sales</h3>
                  <p className="text-sm text-muted-foreground">
                    Quality computer parts and equipment
                  </p>
                </Card>
                <Card className="p-6 mt-8">
                  <Settings className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Maintenance</h3>
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
      <section id="services" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Our Services</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Complete Technology Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From repairs to sales, we provide comprehensive computer services
              for individuals and businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 mb-4">
                <Wrench className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Computer Repair</CardTitle>
                <CardDescription>
                  Expert diagnosis and repair of desktop and laptop computers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Hardware troubleshooting
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Software installation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Virus removal
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Data recovery
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 mb-4">
                <ShoppingCart className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Parts & Equipment</CardTitle>
                <CardDescription>
                  Quality computer parts, accessories, and complete systems
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Computer components
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Accessories & peripherals
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Complete systems
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Custom builds
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 mb-4">
                <Wifi className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Network Setup</CardTitle>
                <CardDescription>
                  Professional network installation and configuration services
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    WiFi setup
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Network security
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Router configuration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Troubleshooting
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 mb-4">
                <HardDrive className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Data Services</CardTitle>
                <CardDescription>
                  Data backup, recovery, and migration services
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Data backup solutions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    File recovery
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    System migration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Cloud setup
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 mb-4">
                <Smartphone className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Mobile Devices</CardTitle>
                <CardDescription>
                  Smartphone and tablet repair and support services
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Screen replacement
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Battery replacement
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Software issues
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Data transfer
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 mb-4">
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Business Support</CardTitle>
                <CardDescription>
                  Comprehensive IT support for small and medium businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    IT consulting
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    System maintenance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Security solutions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Remote support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Why Choose Us</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Professional & Reliable Service
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We combine technical expertise with exceptional customer service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Fast Turnaround</h3>
              <p className="text-muted-foreground">
                Most repairs completed within 24-48 hours
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Quality Guarantee</h3>
              <p className="text-muted-foreground">
                All repairs backed by our quality guarantee
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Expert Technicians</h3>
              <p className="text-muted-foreground">
                Certified professionals with years of experience
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Latest Technology</h3>
              <p className="text-muted-foreground">
                Up-to-date with the latest technology trends
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Get In Touch</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">Contact Us Today</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to get your computer fixed or need new equipment? Contact us
              for a quote
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">
                      Mon-Fri 9AM-6PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">
                      info@comprintservices.com
                    </p>
                    <p className="text-sm text-muted-foreground">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-muted-foreground">123 Tech Street</p>
                    <p className="text-muted-foreground">
                      Digital City, DC 12345
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-lg">
                <h3 className="font-semibold mb-2">Emergency Service</h3>
                <p className="text-muted-foreground mb-4">
                  Need urgent computer repair? We offer emergency service for
                  critical business systems.
                </p>
                <Button variant="outline">Call Emergency Line</Button>
              </div>
            </div>

            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle>Request Service Quote</CardTitle>
                <CardDescription>
                  Tell us about your computer issue and we'll get back to you
                  with a quote
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Service Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Select service type"
                    >
                      <option>Computer Repair</option>
                      <option>Laptop Repair</option>
                      <option>Data Recovery</option>
                      <option>Network Setup</option>
                      <option>Parts Purchase</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Describe your computer issue or what you need..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Request Quote
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Monitor className="h-6 w-6 text-primary" />
                <span className="font-bold">Comprint Services</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Professional computer repair and sales services. Your trusted
                technology partner.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Computer Repair</li>
                <li>Laptop Service</li>
                <li>Data Recovery</li>
                <li>Network Setup</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Computer Parts</li>
                <li>Accessories</li>
                <li>Complete Systems</li>
                <li>Software</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>+1 (555) 123-4567</li>
                <li>info@comprintservices.com</li>
                <li>123 Tech Street</li>
                <li>Digital City, DC 12345</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Comprint Services. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
