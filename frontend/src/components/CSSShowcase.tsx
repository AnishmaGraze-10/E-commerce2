import React from 'react'

const CSSShowcase: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8">CSS Framework Showcase</h1>
      
      {/* Typography Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Typography</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h1 className="text-5xl">Heading 1</h1>
            <h2 className="text-4xl">Heading 2</h2>
            <h3 className="text-3xl">Heading 3</h3>
            <h4 className="text-2xl">Heading 4</h4>
            <h5 className="text-xl">Heading 5</h5>
            <h6 className="text-lg">Heading 6</h6>
          </div>
          <div>
            <p className="text-base">Base text (16px)</p>
            <p className="text-lg">Large text (18px)</p>
            <p className="text-sm">Small text (14px)</p>
            <p className="text-xs">Extra small text (12px)</p>
            <p className="font-light">Light weight text</p>
            <p className="font-normal">Normal weight text</p>
            <p className="font-medium">Medium weight text</p>
            <p className="font-semibold">Semibold weight text</p>
            <p className="font-bold">Bold weight text</p>
          </div>
        </div>
      </section>

      {/* Color Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary p-4 rounded text-white text-center">Primary</div>
          <div className="bg-secondary p-4 rounded text-white text-center">Secondary</div>
          <div className="bg-success p-4 rounded text-white text-center">Success</div>
          <div className="bg-warning p-4 rounded text-white text-center">Warning</div>
          <div className="bg-error p-4 rounded text-white text-center">Error</div>
          <div className="bg-neutral p-4 rounded text-white text-center">Neutral</div>
          <div className="text-primary p-4 rounded border border-primary text-center">Primary Text</div>
          <div className="text-secondary p-4 rounded border border-secondary text-center">Secondary Text</div>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Button Variants</h4>
            <div className="space-y-3">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-outline">Outline Button</button>
              <button className="btn btn-ghost">Ghost Button</button>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Button Sizes</h4>
            <div className="space-y-3">
              <button className="btn btn-primary btn-sm">Small Button</button>
              <button className="btn btn-primary">Normal Button</button>
              <button className="btn btn-primary btn-lg">Large Button</button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Navigation</h2>
        <nav className="navbar">
          <div className="navbar-container">
            <a href="#" className="navbar-brand">Brand Logo</a>
            <ul className="navbar-nav">
              <li><a href="#" className="nav-link">Home</a></li>
              <li><a href="#" className="nav-link active">Products</a></li>
              <li><a href="#" className="nav-link">About</a></li>
              <li><a href="#" className="nav-link">Contact</a></li>
            </ul>
          </div>
        </nav>
      </section>

      {/* Product Cards Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Product Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="product-card">
            <img 
              src="https://via.placeholder.com/300x200/0ea5e9/ffffff?text=Product+1" 
              alt="Product 1" 
              className="product-card-image"
            />
            <div className="product-card-content">
              <div className="product-card-category">Skincare</div>
              <h3 className="product-card-title">Organic Face Serum</h3>
              <div className="product-card-price">$49.99</div>
              <div className="product-card-stock">In Stock: 25</div>
              <div className="product-card-actions">
                <button className="btn btn-primary btn-sm">Add to Cart</button>
                <button className="btn btn-outline btn-sm">View Details</button>
              </div>
            </div>
          </div>

          <div className="product-card">
            <img 
              src="https://via.placeholder.com/300x200/d946ef/ffffff?text=Product+2" 
              alt="Product 2" 
              className="product-card-image"
            />
            <div className="product-card-content">
              <div className="product-card-category">Makeup</div>
              <h3 className="product-card-title">Natural Foundation</h3>
              <div className="product-card-price">$34.99</div>
              <div className="product-card-stock">In Stock: 12</div>
              <div className="product-card-actions">
                <button className="btn btn-primary btn-sm">Add to Cart</button>
                <button className="btn btn-outline btn-sm">View Details</button>
              </div>
            </div>
          </div>

          <div className="product-card">
            <img 
              src="https://via.placeholder.com/300x200/22c55e/ffffff?text=Product+3" 
              alt="Product 3" 
              className="product-card-image"
            />
            <div className="product-card-content">
              <div className="product-card-category">Hair Care</div>
              <h3 className="product-card-title">Hydrating Shampoo</h3>
              <div className="product-card-price">$24.99</div>
              <div className="product-card-stock">In Stock: 8</div>
              <div className="product-card-actions">
                <button className="btn btn-primary btn-sm">Add to Cart</button>
                <button className="btn btn-outline btn-sm">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Forms</h2>
        <div className="max-w-md">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" rows={4} placeholder="Enter your message"></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" aria-label="Select a category">
              <option>Select a category</option>
              <option>General Inquiry</option>
              <option>Support</option>
              <option>Feedback</option>
            </select>
          </div>
          <button className="btn btn-primary w-full">Submit Form</button>
        </div>
      </section>

      {/* Spacing & Layout Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Spacing & Layout</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary p-4 text-white text-center">p-4</div>
          <div className="bg-secondary p-6 text-white text-center">p-6</div>
          <div className="bg-success p-8 text-white text-center">p-8</div>
          <div className="bg-warning p-10 text-white text-center">p-10</div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-200 p-4 text-center">m-4</div>
          <div className="bg-neutral-300 p-4 text-center m-6">m-6</div>
          <div className="bg-neutral-400 p-4 text-center m-8">m-8</div>
          <div className="bg-neutral-500 p-4 text-center m-10">m-10</div>
        </div>
      </section>

      {/* Animations Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary text-white p-6 rounded animate-fade-in text-center">
            Fade In Animation
          </div>
          <div className="bg-secondary text-white p-6 rounded animate-slide-in text-center">
            Slide In Animation
          </div>
          <div className="bg-success text-white p-6 rounded animate-scale-in text-center">
            Scale In Animation
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Footer</h2>
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>About Us</h3>
                <p>We are dedicated to providing high-quality organic beauty products that enhance your natural beauty.</p>
              </div>
              <div className="footer-section">
                <h3>Quick Links</h3>
                <ul>
                  <li><a href="#">Home</a></li>
                  <li><a href="#">Products</a></li>
                  <li><a href="#">About</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h3>Contact Info</h3>
                <ul>
                  <li>Email: info@example.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Beauty St, City</li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 Beauty Store. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </section>

      {/* Responsive Grid Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Responsive Grid</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-primary p-4 text-white text-center rounded">Grid Item 1</div>
          <div className="bg-secondary p-4 text-white text-center rounded">Grid Item 2</div>
          <div className="bg-success p-4 text-white text-center rounded">Grid Item 3</div>
          <div className="bg-warning p-4 text-white text-center rounded">Grid Item 4</div>
        </div>
      </section>
    </div>
  )
}

export default CSSShowcase 