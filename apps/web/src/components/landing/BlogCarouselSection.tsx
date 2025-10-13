import React, { useState } from 'react';

const blogPosts = [
  {
    title: "How to Integrate AI into Your Business Workflow: A Complete Guide",
    excerpt: "Learn the step-by-step process of successfully integrating AI into your existing business processes and workflows.",
    author: "Dr. Emily Watson",
    publishDate: "2024-01-15",
    lastUpdated: "2024-01-20",
    readTime: 12,
    category: "AI Integration",
    slug: "ai-business-workflow-integration",
    featured: true,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    funnelStage: "awareness"
  },
  {
    title: "5 AI Automation Use Cases That Will Transform Your Business",
    excerpt: "Discover the most impactful AI automation scenarios that leading companies are implementing today.",
    author: "Alex Thompson",
    publishDate: "2024-01-10",
    readTime: 8,
    category: "AI Use Cases",
    slug: "ai-automation-use-cases",
    featured: true,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    funnelStage: "awareness"
  },
  {
    title: "ROI of AI Integration: Real Numbers from Real Companies",
    excerpt: "See how companies achieved 300% ROI within 6 months by integrating AI into their workflows.",
    author: "Michael Chang",
    publishDate: "2024-01-08",
    readTime: 10,
    category: "ROI Analysis",
    slug: "ai-integration-roi",
    featured: true,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    funnelStage: "consideration"
  },
  {
    title: "Building Your First AI Workflow: A Step-by-Step Tutorial",
    excerpt: "Follow this comprehensive tutorial to create your first AI-powered workflow with TETRIX.",
    author: "David Kim",
    publishDate: "2024-01-05",
    readTime: 15,
    category: "Tutorials",
    slug: "first-ai-workflow-tutorial",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    funnelStage: "consideration"
  },
  {
    title: "AI Integration Best Practices: Lessons from 100+ Implementations",
    excerpt: "Key insights and best practices from successful AI integration projects across various industries.",
    author: "Lisa Park",
    publishDate: "2024-01-03",
    readTime: 11,
    category: "Best Practices",
    slug: "ai-integration-best-practices",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    funnelStage: "decision"
  },
  {
    title: "The Future of Work: How AI is Reshaping Business Operations",
    excerpt: "Explore how AI integration is transforming business operations and what it means for your company.",
    author: "Dr. Robert Chen",
    publishDate: "2023-12-28",
    readTime: 9,
    category: "Industry Trends",
    slug: "future-of-work-ai",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    funnelStage: "decision"
  }
];

const funnelStages = [
  { key: 'awareness', label: 'Awareness' },
  { key: 'consideration', label: 'Consideration' },
  { key: 'decision', label: 'Decision' },
];

function BlogCard({ post }: { post: typeof blogPosts[0] }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      <img src={post.image} alt={post.title} className="w-full h-40 object-cover" />
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-2">{post.title}</h3>
        <p className="text-gray-600 mb-4 flex-1">{post.excerpt}</p>
        <div className="text-xs text-gray-400 mb-2">By {post.author} &middot; {post.readTime} min read</div>
        <a href={`/blog/${post.slug}`} className="text-brand-orange font-semibold hover:underline mt-auto">Read More &rarr;</a>
      </div>
    </div>
  );
}

export default function BlogCarouselSection() {
  const [stage, setStage] = useState('awareness');
  const posts = blogPosts.filter((p) => p.funnelStage === stage).slice(0, 3);

  return (
    <section className="py-16 bg-gradient-to-br from-brand-light to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4">
            Featured Insights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover strategies and insights tailored to your journey with TETRIX
          </p>
        </div>
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
            {funnelStages.map((f) => (
              <button
                key={f.key}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${stage === f.key ? 'bg-brand-orange text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setStage(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="grid gap-8 md:grid-cols-3">
            {posts.map((post, i) => (
              <BlogCard key={i} post={post} />
            ))}
          </div>
        </div>
        <div className="text-center mt-12">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-red transition-colors"
          >
            View All Posts
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
} 