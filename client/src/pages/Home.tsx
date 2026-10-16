import { useEffect, useState } from "react";
import { Sprout, Leaf, Award, Flower, ArrowDown, ArrowRight, ArrowUpRight, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(2); // Default to 3rd item (index 2) open as per original design

  const faqData = [
    {
      question: "How do I prepare my soil for planting?",
      answer: "Start by testing your soil pH and nutrient levels. Remove any weeds and debris. Loosen the soil to a depth of 12-15 inches and mix in organic compost or well-rotted manure to improve structure and fertility."
    },
    {
      question: "What are the key factors for successful crop rotation?",
      answer: "The key factors include varying crop families to prevent pest buildup, alternating between deep and shallow-rooted plants, and including nitrogen-fixing crops like legumes in the rotation cycle."
    },
    {
      question: "What is organic farming, and how does it differ from conventional farming?",
      answer: "Conventional farming uses chemical fertilizers to promote plant growth, while organic farming employs manure and compost to fertilize the soil. Conventional farming sprays pesticides to get rid of pests, while organic farmers turn to insects and birds."
    },
    {
      question: "How can I control weeds effectively without harming my crops?",
      answer: "Mulching is very effective for suppressing weeds. You can also use drip irrigation to water only crops (starving weeds), practice crop rotation, and hand-pull or hoe weeds while they are small."
    },
    {
      question: "What are the benefits of using cover crops?",
      answer: "Cover crops prevent soil erosion, improve soil structure, suppress weeds, and can add nitrogen to the soil (if legumes are used). They also help retain soil moisture and increase organic matter."
    },
    {
      question: "How do I manage irrigation efficiently to conserve water?",
      answer: "Use drip irrigation to deliver water directly to roots, mulch to reduce evaporation, water early in the morning or late evening, and group plants with similar water needs together."
    }
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  useEffect(() => {
    // Note: Removed the redirect logic to allow viewing the landing page even if logged in, 
    // or can keep it if strictly desired. For now, assuming standard landing page behavior.
    // Restoring original logic if needed:
    // const token = localStorage.getItem("token");
    // if (token) {
    //   navigate("/dashboard", { replace: true });
    // }

    // Initialize AOS animations
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
      easing: 'ease-out-cubic'
    });
  }, []);

  return (
    <div className="scroll-smooth bg-background transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10" data-aos="fade-up">
          <h1 className="md:text-6xl lg:text-7xl leading-tight text-4xl font-semibold text-foreground tracking-tight mb-6">
            Cultivating A
            <span className="inline-flex items-center justify-center align-middle mx-2 h-12 w-24 md:h-16 md:w-32 rounded-full overflow-hidden border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop"
                alt="Hands holding plant"
                className="w-full h-full object-cover"
              />
            </span>
            Sustainable Future
            <br />
            Through Modern Agriculture
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base mb-10 leading-relaxed">
            There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.
          </p>
          <div className="flex justify-center">
            <button className="h-14 w-14 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-transform duration-300 hover:scale-110 shadow-lg shadow-green-600/20">
              <ArrowDown className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid / Features */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Card: Green */}
          <div className="md:col-span-4 bg-green-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden min-h-[400px] group" data-aos="fade-up" data-aos-delay="100">
            {/* Image Overlay */}
            <img
              src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2071&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700"
              alt="Farmer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 to-transparent"></div>

            <div className="relative z-10 mt-auto">
              <h3 className="text-2xl font-semibold mb-3 tracking-tight">Cultivating Growth Through Modern Agriculture</h3>
              <p className="text-green-100 text-xs leading-relaxed mb-6 opacity-80">There are many variations of passages of Lorem Ipsum available, but the majority.</p>
              <a href="#" className="inline-flex items-center text-sm font-medium hover:gap-2 transition-all">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Middle Column: Quality Products with 2 sub-sections */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex-1 bg-green-50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="w-10 h-10 mb-4 text-green-600">
                <Award className="w-full h-full stroke-1" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Quality Products</h3>
              <p className="text-muted-foreground text-xs max-w-[200px]">There are many variations of passages available.</p>
              <button className="mt-4 bg-green-600 text-white text-xs px-4 py-2 rounded-full hover:bg-green-700 transition">Learn More</button>
            </div>
            <div className="h-[200px] rounded-[2.5rem] overflow-hidden relative" data-aos="fade-up" data-aos-delay="300">
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
                className="w-full h-full object-cover"
                alt="Agriculture"
              />
            </div>
          </div>

          {/* Right Card: Natural Farming with Background Image */}
          <div className="md:col-span-4 bg-green-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden min-h-[400px] group" data-aos="fade-up" data-aos-delay="400">
            {/* Background Image */}
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700"
              alt="Natural Farming"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 to-transparent"></div>

            <div className="relative z-10 mt-auto">
              <h3 className="text-2xl font-semibold mb-3 tracking-tight">Natural Farming</h3>
              <p className="text-green-100 text-xs leading-relaxed mb-6 opacity-80">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.</p>
              <a href="#" className="inline-flex items-center text-sm font-medium hover:gap-2 transition-all">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12" data-aos="fade-up">
            <div className="max-w-xl">
              <span className="text-yellow-500 font-semibold text-xs tracking-wider uppercase mb-2 block">About Us</span>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground">
                Cultivating a Future of
                Sustainable Agriculture <Leaf className="inline w-8 h-8 text-green-600 ml-2" />
              </h2>
            </div>
            <div className="max-w-md mt-6 md:mt-0">
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.
              </p>
              <a href="#" className="text-green-600 font-medium text-sm flex items-center hover:gap-2 transition-all">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="rounded-[2.5rem] overflow-hidden h-[400px] md:h-[500px] relative w-full" data-aos="zoom-in">
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
              alt="Watering Can"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-muted rounded-[2rem] p-8" data-aos="fade-up" data-aos-delay="0">
            <h3 className="text-4xl font-semibold mb-2 text-foreground">95%</h3>
            <p className="text-sm font-semibold text-foreground mb-2">Clients Satisfaction</p>
            <p className="text-xs text-muted-foreground leading-relaxed">There are many variations of passages of Lorem Ipsum available.</p>
          </div>
          {/* Stat 2 */}
          <div className="bg-green-600 rounded-[2rem] p-8 text-white" data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-4xl font-semibold mb-2">100+</h3>
            <p className="text-sm font-semibold mb-2">Farmers in the farms</p>
            <p className="text-xs text-green-100 leading-relaxed opacity-80">There are many variations of passages of Lorem Ipsum available.</p>
          </div>
          {/* Stat 3 */}
          <div className="bg-muted rounded-[2rem] p-8" data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-4xl font-semibold mb-2 text-foreground">400+</h3>
            <p className="text-sm font-semibold text-foreground mb-2">Total Clients</p>
            <p className="text-xs text-muted-foreground leading-relaxed">There are many variations of passages of Lorem Ipsum available.</p>
          </div>
          {/* Stat 4 */}
          <div className="bg-muted rounded-[2rem] p-8" data-aos="fade-up" data-aos-delay="300">
            <h3 className="text-4xl font-semibold mb-2 text-foreground">100%</h3>
            <p className="text-sm font-semibold text-foreground mb-2">Fresh Food</p>
            <p className="text-xs text-muted-foreground leading-relaxed">There are many variations of passages of Lorem Ipsum available.</p>
          </div>
        </div>
      </section>

      {/* Comprehensive Offerings */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="text-yellow-500 font-semibold text-xs tracking-wider uppercase mb-2 inline-flex items-center gap-1">
              Why Choose Us <Sprout className="w-4 h-4" />
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-900">Comprehensive Agricultural Offerings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Left Image */}
            <div className="h-80 md:h-96 rounded-[2rem] overflow-hidden" data-aos="fade-right">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop"
                className="w-full h-full object-cover"
                alt="Farmer in field"
              />
            </div>

            {/* Middle Text & Boxes */}
            <div className="flex flex-col gap-6">
              <div className="bg-card p-4 rounded-xl" data-aos="fade-up">
                <p className="text-xs text-muted-foreground leading-relaxed">Discover a wide range of high-quality farm products designed to enhance your agricultural endeavors. We take pride in offering innovative solutions that help you achieve optimal results.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-green-700 rounded-[2rem] p-6 flex flex-col justify-center text-white" data-aos="zoom-in">
                  <h4 className="text-3xl font-bold mb-1">25 Years</h4>
                  <p className="text-xs opacity-90">Of Experience In Agriculture.</p>
                </div>
                <div className="bg-yellow-500 rounded-[2rem] p-6 flex flex-col justify-center text-white" data-aos="zoom-in" data-aos-delay="100">
                  <h4 className="text-xl font-bold mb-1">100%</h4>
                  <p className="text-xs opacity-90">Natural Healthy Food</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="h-80 md:h-96 rounded-[2rem] overflow-hidden" data-aos="fade-left">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop"
                className="w-full h-full object-cover"
                alt="Fields"
              />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Card */}
            <div className="md:col-span-4 bg-green-50 rounded-[2rem] p-8 relative overflow-hidden" data-aos="fade-up">
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center text-white mb-4 absolute top-0 right-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <Flower className="w-12 h-12 text-green-600 mb-6 stroke-1" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">Explore Our Farm Products</h3>
                <p className="text-xs text-green-800 max-w-xs">Discover a wide range of high-quality farm products designed to enhance.</p>
              </div>
            </div>

            {/* List Items */}
            <div className="md:col-span-8 bg-card border border-border rounded-[2rem] p-8 flex flex-col justify-center" data-aos="fade-up" data-aos-delay="100">
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">1</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Seeds and Seedlings</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-md">Choose from a variety of premium seeds and healthy seedlings to ensure a strong start.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">2</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Fertilizers and Soil Enhancers</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-md">Enhance soil fertility and promote healthy plant growth with our range of organic fertilizers.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">3</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Crop Protection</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-md">Safeguard your crops from pests and diseases with our proven range of environmentally friendly solutions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section (Beige) */}
      <section className="py-20 px-6 bg-[#FFF9F0] dark:bg-card">
        <div className="max-w-7xl mx-auto">
          <span className="text-yellow-500 font-semibold text-xs tracking-wider uppercase mb-4 block">Our Product Details</span>
          <div className="flex flex-col lg:flex-row gap-12">

            <div className="lg:w-1/2" data-aos="fade-right">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-8">
                We're Top Agriculture &  Organic Enterprises
              </h2>
              <div className="rounded-[2.5rem] overflow-hidden h-[400px] relative group">
                <img
                  src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2070&auto=format&fit=crop"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Farmer Portrait"
                />
                <div className="absolute bottom-6 left-6">
                  <button className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2" data-aos="fade-left">
              <p className="text-sm text-gray-500 mb-8">Discover a wide range of high-quality farm products designed to enhance your agricultural endeavors. We take pride in offering.</p>
              <Link to="/register">
                <button className="px-6 py-3 border border-gray-300 rounded-full text-xs font-semibold hover:bg-gray-900 hover:text-white transition-colors mb-10">
                  Get Started
                </button>
              </Link>

              <div className="space-y-6">
                {/* Product Item */}
                <div className="flex items-start gap-4 p-4 hover:bg-white dark:hover:bg-muted/10 rounded-2xl transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Organic Corn</h4>
                    <p className="text-xs text-muted-foreground mt-1">Natus error volupt ateme accus antium dolores.</p>
                  </div>
                </div>
                {/* Product Item */}
                <div className="flex items-start gap-4 p-4 hover:bg-white rounded-2xl transition-colors">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Organic Tomato</h4>
                    <p className="text-xs text-muted-foreground mt-1">Explore our range of tractors and attachments designed.</p>
                  </div>
                </div>
                {/* Product Item */}
                <div className="flex items-start gap-4 p-4 hover:bg-white rounded-2xl transition-colors">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Fruits & Meats</h4>
                    <p className="text-xs text-muted-foreground mt-1">Explore our range of tractors and attachments designed.</p>
                  </div>
                </div>
                {/* Product Item */}
                <div className="flex items-start gap-4 p-4 hover:bg-white rounded-2xl transition-colors">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Fresh Orange</h4>
                    <p className="text-xs text-muted-foreground mt-1">Explore our range of tractors and attachments designed.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="text-yellow-500 font-semibold text-xs tracking-wider uppercase mb-2 inline-flex items-center gap-1">
              FAQ <Leaf className="w-4 h-4" />
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Frequently Answer And Question</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className={`group rounded-2xl transition-all duration-300 overflow-hidden ${activeFaq === index
                  ? "bg-green-50 border border-green-100"
                  : "bg-gray-50 hover:bg-gray-100"
                  }`}
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <span className={`ml-6 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${activeFaq === index
                    ? "bg-green-600 text-white"
                    : "border border-gray-300 group-hover:bg-white text-gray-500"
                    }`}>
                    {activeFaq === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${activeFaq === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-xs leading-relaxed text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="py-12 px-6 pb-6 bg-[#EDF3E9] dark:bg-muted relative overflow-hidden mt-10">
        {/* Floating Leaves (Decor) */}
        <Leaf className="absolute top-10 left-10 text-green-800/10 w-20 h-20 -rotate-45" />
        <Leaf className="absolute bottom-10 right-10 text-green-800/10 w-32 h-32 rotate-12" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* CTA Card */}
          <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-[3rem] p-12 text-center mb-20 relative overflow-hidden" data-aos="zoom-in">
            {/* Decorative blurred circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10 flex flex-col items-center">
              <Sprout className="text-yellow-600 w-12 h-12 mb-4" />
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">Become a Part of Our Growing Community!</h2>
              <p className="text-gray-600 text-xs max-w-lg mb-8 leading-relaxed">It is a long established fact that a reader will be distracted by the readable.</p>
              <Link to="/register">
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-sm font-semibold transition-all shadow-lg shadow-green-600/20">Get Started</button>
              </Link>
            </div>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-200/50 pb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Sprout className="text-green-700 h-6 w-6" />
                <span className="font-bold text-lg text-foreground">AgroAI</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">20 W, New York, United States. House Name: Khangali Pal.</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <span>📞</span>
                </div>
                +096541565
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-6">Company Profile</h4>
              <ul className="space-y-3 text-xs text-gray-600">
                <li><a href="#" className="hover:text-green-700 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> About</a></li>
                <li><a href="#" className="hover:text-green-700 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Help Center</a></li>
                <li><a href="#" className="hover:text-green-700 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Career</a></li>
                <li><a href="#" className="hover:text-green-700 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Plans & Pricing</a></li>
                <li><Link to="/contact" className="hover:text-green-700 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-6">Quick Links</h4>
              <ul className="space-y-3 text-xs text-gray-600">
                <li><a href="#" className="hover:text-green-700 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Browse AgroAI</a></li>
                <li><a href="#" className="hover:text-green-700 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Browse AgroAI</a></li>
                <li><Link to="/register" className="hover:text-green-700 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Registrations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-6">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all">
                  <span>f</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all">
                  <span>i</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all">
                  <span>t</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all">
                  <span>in</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <div className="flex gap-4 mb-4 md:mb-0">
              <a href="#" className="hover:text-gray-900">Terms And Condition</a>
              <span className="w-px h-3 bg-gray-300"></span>
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            </div>
            <p>© 2024 AgroAI Company Limited</p>
          </div>
        </div>
      </section >
    </div >
  );
};

export default Home;
