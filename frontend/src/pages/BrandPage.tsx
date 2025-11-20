

export default function BrandPage() {
	return (
		<div className="container py-4">
			<div className="row align-items-center g-4">
				<div className="col-md-6 text-center">
					<img src="/cosme.jpg" alt="Cosme Kitchen brand visual – organic beauty essentials" className="img-fluid rounded shadow" />
				</div>
				<div className="col-md-6">
					<h2 className="mb-3">Cosme Kitchen — Glow, Gently</h2>
					<p className="lead">
						We make high‑performance skincare and color made from earth‑kind botanicals, crafted in small batches, and tested for results — never on animals.
					</p>
					<p>
						Every jar, tube, and drop is our love letter to your skin and our planet: potent plant actives, minimal formulas, maximum glow. From dawn rituals to moonlight touch‑ups, your beauty routine can be both indulgent and intentional.
					</p>
					<div className="row gy-3 mt-3">
						<div className="col-sm-6">
							<div className="p-3 rounded border h-100">
								<h5 className="mb-2">What makes us different</h5>
								<ul className="mb-0 ps-3">
									<li>Certified organic botanicals</li>
									<li>Vegan & cruelty‑free always</li>
									<li>Dermatologist‑tested formulas</li>
								</ul>
							</div>
						</div>
						<div className="col-sm-6">
							<div className="p-3 rounded border h-100">
								<h5 className="mb-2">Sustainability promise</h5>
								<ul className="mb-0 ps-3">
									<li>Recyclable or refillable packaging</li>
									<li>Low‑impact, traceable sourcing</li>
									<li>Made in small, fresh batches</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="mt-4">
						<h5 className="mb-2">Ingredients we say yes to</h5>
						<p className="mb-1">Cold‑pressed oils, plant ceramides, niacinamide, hyaluronic acid, mineral pigments.</p>
						<h5 className="mt-3 mb-2">Ingredients we skip</h5>
						<p className="mb-0">Parabens, phthalates, microplastics, synthetic fragrances, and anything tested on animals.</p>
					</div>
					<div className="d-flex gap-2 mt-4">
						<a href="/shop" className="btn btn-primary">Shop Bestsellers</a>
						<a href="/brand" className="btn btn-outline-secondary">Learn About Our Process</a>
					</div>
				</div>
			</div>
		</div>
	)
}

