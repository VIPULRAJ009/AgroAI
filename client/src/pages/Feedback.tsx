import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import AgriculturalBackground from "@/components/AgriculturalBackground";
import api from "@/services/api";

const Feedback = () => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (rating === 0) {
        toast({
          title: "Rating Required",
          description: "Please select a star rating before submitting.",
          variant: "destructive",
        });
        return;
      }

      await api.post("/feedback", { ...formData, rating });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
      setRating(0);
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission Failed",
        description: "Could not send feedback. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <AgriculturalBackground />
      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              We Value Your Feedback
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Help us improve AgroAI by sharing your thoughts, suggestions, or reporting issues.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="mb-3 block">Rate Your Experience</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${star <= rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What is your feedback about?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="min-h-[150px] resize-none"
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Submit Feedback
              </Button>
            </form>
          </Card>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-semibold text-foreground mb-2">Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Share ideas for new features
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl mb-2">🐛</div>
              <h3 className="font-semibold text-foreground mb-2">Bug Reports</h3>
              <p className="text-sm text-muted-foreground">
                Help us fix technical issues
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-semibold text-foreground mb-2">General Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Tell us about your experience
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
