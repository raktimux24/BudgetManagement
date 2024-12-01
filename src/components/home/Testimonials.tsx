import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150",
    content: "SubscriptionMaster has transformed how I manage my business subscriptions. The insights have helped me save over $200 monthly!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Tech Professional",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    content: "The dashboard is intuitive and the analytics are incredibly detailed. It's exactly what I needed to keep track of my subscriptions.",
    rating: 5
  },
  {
    name: "Emma Davis",
    role: "Content Creator",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150",
    content: "Finally, a tool that helps me manage all my creative software subscriptions in one place. The reminder system is a lifesaver!",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#121212] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#EAEAEA] mb-4">
            Loved by Thousands
          </h2>
          <p className="text-[#C0C0C0] max-w-2xl mx-auto">
            Join our community of satisfied users who've taken control of their subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-[#1A1A1A] p-6 rounded-xl"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-[#C5A900] fill-current" />
                ))}
              </div>
              <p className="text-[#C0C0C0] mb-6">"{testimonial.content}"</p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="ml-3">
                  <div className="text-[#EAEAEA] font-semibold">{testimonial.name}</div>
                  <div className="text-[#C0C0C0] text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}