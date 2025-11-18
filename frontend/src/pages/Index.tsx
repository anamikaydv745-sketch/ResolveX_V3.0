import { Link } from "react-router-dom";
import { Trash2, Droplet, Map, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Leaderboard from "@/components/Leaderboard";
import RecentReports from "@/components/RecentReports";
import heroImage from "@/assets/hero-community.jpg";
import wasteImage from "@/assets/waste-reporting.jpg";
import waterImage from "@/assets/water-testing.jpg";
import LiveEnvironmentalMap from "@/components/LiveEnvironmentalMap";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-background" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Empower Your Community
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow">
            Join thousands of citizens in creating a cleaner, healthier environment through
            community-driven action and real-time monitoring
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg" className="text-lg">
              <Link to="/report-waste">
                <Trash2 className="mr-2 h-5 w-5" />
                Report Waste
              </Link>
            </Button>
            <Button asChild variant="action" size="lg" className="text-lg">
              <Link to="/water-testing">
                <Droplet className="mr-2 h-5 w-5" />
                Log Water Data
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Your Platform for Environmental Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A unified portal empowering citizens to report environmental issues and monitor
              water quality in their communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Waste Reporting Card */}
            <Card className="shadow-elevated hover:shadow-lg transition-smooth border-2 hover:border-primary/50">
              <CardHeader>
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img 
                    src={wasteImage} 
                    alt="Waste Management System" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trash2 className="h-6 w-6 text-primary" />
                  Community Waste Reporting
                </CardTitle>
                <CardDescription className="text-base">
                  AI-powered waste categorization and real-time tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground">Smart photo recognition for waste types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground">GPS auto-tagging and location mapping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground">Track reports and earn rewards</span>
                  </li>
                </ul>
                <Button asChild className="w-full" variant="default">
                  <Link to="/report-waste">Start Reporting</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Water Testing Card */}
            <Card className="shadow-elevated hover:shadow-lg transition-smooth border-2 hover:border-secondary/50">
              <CardHeader>
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img 
                    src={waterImage} 
                    alt="Water Quality Testing" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Droplet className="h-6 w-6 text-secondary" />
                  Water Quality Monitoring
                </CardTitle>
                <CardDescription className="text-base">
                  Real-time contamination tracking and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-secondary" />
                    </div>
                    <span className="text-muted-foreground">Easy data input for water testing kits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-secondary" />
                    </div>
                    <span className="text-muted-foreground">IoT sensor integration support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-secondary" />
                    </div>
                    <span className="text-muted-foreground">Automated safety alerts and analytics</span>
                  </li>
                </ul>
                <Button asChild className="w-full" variant="secondary">
                  <Link to="/water-testing">Log Water Data</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Preview Section */}
<section className="py-16 bg-muted/30">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-foreground mb-4">
        Live Environmental Map
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Real-time visualization of waste reports and water quality across your community
      </p>
    </div>

    <Card className="max-w-6xl mx-auto shadow-elevated overflow-hidden">
      <CardContent className="p-0">
        <div className="w-full h-[500px]">
          <LiveEnvironmentalMap />
        </div>
      </CardContent>
    </Card>
  </div>
</section>


      {/* Community Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <RecentReports />
            <Leaderboard />
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Community Impact
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Together, we're making a real difference in our environment
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { label: "Reports Submitted", value: "2,547", icon: Trash2 },
              { label: "Issues Resolved", value: "1,892", icon: TrendingUp },
              { label: "Water Tests Logged", value: "876", icon: Droplet },
              { label: "Active Citizens", value: "1,234", icon: TrendingUp },
            ].map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-base">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-12 w-12 text-white mx-auto mb-4" />
                  <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-white/80">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-base">How It Works</a></li>
                <li><a href="#" className="hover:text-primary transition-base">Our Mission</a></li>
                <li><a href="#" className="hover:text-primary transition-base">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-base">Waste Reporting</a></li>
                <li><a href="#" className="hover:text-primary transition-base">Water Testing</a></li>
                <li><a href="#" className="hover:text-primary transition-base">Live Maps</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-base">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-base">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-base">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Partners</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-base">Municipal Corp</a></li>
                <li><a href="#" className="hover:text-primary transition-base">NGO Partners</a></li>
                <li><a href="#" className="hover:text-primary transition-base">Become a Partner</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Sudhaar. Empowering communities for a cleaner tomorrow.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
