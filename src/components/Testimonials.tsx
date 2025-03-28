
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatarSrc?: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah M.",
      role: "Community Group Leader",
      content: "PesaLytics transformed how we track our chama contributions. Now everyone trusts our process and we've increased participation by 40%!"
    },
    {
      id: 2,
      name: "James K.",
      role: "Wedding Committee Chair",
      content: "Managing our wedding fundraiser became incredibly easy with PesaLytics. The automated reports made transparency a non-issue."
    },
    {
      id: 3,
      name: "Mercy W.",
      role: "Small Business Owner",
      content: "I use PesaLytics to manage all my M-PESA transactions for my business. The analytics have helped me understand my cash flow better."
    },
    {
      id: 4,
      name: "David O.",
      role: "Family Reunion Organizer",
      content: "Our annual family reunion collections used to be chaotic. With PesaLytics, I can organize everything and send beautiful reports to everyone."
    },
    {
      id: 5,
      name: "Grace N.",
      role: "Church Treasurer",
      content: "The transparency PesaLytics provides has increased our church donations significantly. Members can see exactly where their money goes."
    }
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Discover how PesaLytics is helping individuals and organizations across Kenya manage their finances and contributions effectively.
        </p>
        
        <div className="relative mx-auto max-w-5xl px-8">
          <Carousel 
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          {testimonial.avatarSrc ? (
                            <AvatarImage src={testimonial.avatarSrc} alt={testimonial.name} />
                          ) : (
                            <AvatarFallback className="bg-green-100 text-green-800">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                          <CardDescription>{testimonial.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">"{testimonial.content}"</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8 gap-2">
              <CarouselPrevious className="position-static" />
              <CarouselNext className="position-static" />
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
