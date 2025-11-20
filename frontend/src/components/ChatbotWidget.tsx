import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { skinAnalyzer } from '../utils/skinAnalysis'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

// Dynamic Language support with auto-detection
type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'gu' | 'kn' | 'ml' | 'mr' | 'pa' | 'ur'

const LANGUAGE_NAMES = {
	en: 'English',
	hi: 'हिंदी',
	ta: 'தமிழ்',
	te: 'తెలుగు',
	bn: 'বাংলা',
	gu: 'ગુજરાતી',
	kn: 'ಕನ್ನಡ',
	ml: 'മലയാളം',
	mr: 'मराठी',
	pa: 'ਪੰਜਾਬੀ',
	ur: 'اردو'
}

// Dynamic language detection patterns
const LANGUAGE_PATTERNS = {
	hi: /[\u0900-\u097F]/,
	ta: /[\u0B80-\u0BFF]/,
	te: /[\u0C00-\u0C7F]/,
	bn: /[\u0980-\u09FF]/,
	gu: /[\u0A80-\u0AFF]/,
	kn: /[\u0C80-\u0CFF]/,
	ml: /[\u0D00-\u0D7F]/,
	mr: /[\u0D80-\u0DFF]/,
	pa: /[\u0A00-\u0A7F]/,
	ur: /[\u0600-\u06FF]/
}

// Dynamic context detection
type UserContext = {
	skinType?: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal'
	skinTone?: 'fair' | 'medium' | 'dark' | 'olive'
	preferences?: {
		budget?: 'low' | 'medium' | 'high'
		finish?: 'matte' | 'glossy' | 'shimmer' | 'natural'
		occasion?: 'party' | 'office' | 'casual' | 'wedding'
	}
	mood?: 'happy' | 'confident' | 'tired' | 'excited' | 'professional'
	language?: Language
}

	const TRANSLATIONS = {
	en: {
		welcome: "Hi! I'm your AI Beauty Assistant ✨ I can help with skin analysis, AR try-ons, personalized routines, and product recommendations. What would you like to explore today?",
		voicePrompt: "Click the microphone to speak or type your message",
		analyzing: "Analyzing your skin...",
		recommendations: "Here are my recommendations for you:",
		addToCart: "Add to Cart",
		startAnalysis: "Start Skin Analysis",
		openAR: "Open AR Mode",
		generateRoutine: "Generate Routine"
	},
	hi: {
		welcome: "नमस्ते! मैं आपकी AI Beauty Assistant हूं ✨ मैं skin analysis, AR try-ons, personalized routines और product recommendations में मदद कर सकती हूं। आज आप क्या explore करना चाहते हैं?",
		voicePrompt: "बोलने के लिए microphone पर click करें या message type करें",
		analyzing: "आपकी skin का analysis हो रहा है...",
		recommendations: "आपके लिए मेरी recommendations यहां हैं:",
		addToCart: "Cart में Add करें",
		startAnalysis: "Skin Analysis शुरू करें",
		openAR: "AR Mode खोलें",
		generateRoutine: "Routine बनाएं"
	},
	ta: {
		welcome: "வணக்கம்! நான் உங்கள் AI Beauty Assistant ✨ நான் skin analysis, AR try-ons, personalized routines மற்றும் product recommendations உதவ முடியும். இன்று நீங்கள் என்ன explore செய்ய விரும்புகிறீர்கள்?",
		voicePrompt: "பேச microphone-ஐ click செய்யுங்கள் அல்லது message type செய்யுங்கள்",
		analyzing: "உங்கள் skin-ஐ analyze செய்கிறேன்...",
		recommendations: "உங்களுக்கான எனது recommendations இங்கே:",
		addToCart: "Cart-ஐ Add செய்யுங்கள்",
		startAnalysis: "Skin Analysis தொடங்குங்கள்",
		openAR: "AR Mode திறக்கவும்",
		generateRoutine: "Routine உருவாக்குங்கள்"
	},
	te: {
		welcome: "నమస్కారం! నేను మీ AI Beauty Assistant ✨ నేను skin analysis, AR try-ons, personalized routines మరియు product recommendations సహాయం చేయగలను. ఈరోజు మీరు ఏమి explore చేయాలనుకుంటున్నారు?",
		voicePrompt: "మాట్లాడడానికి microphone పై click చేయండి లేదా message type చేయండి",
		analyzing: "మీ skin-ను analyze చేస్తున్నాను...",
		recommendations: "మీకు నా recommendations ఇక్కడ ఉన్నాయి:",
		addToCart: "Cart-కు Add చేయండి",
		startAnalysis: "Skin Analysis ప్రారంభించండి",
		openAR: "AR Mode తెరవండి",
		generateRoutine: "Routine సృష్టించండి"
	}
}

type Message = { id: string; role: 'user' | 'bot'; text: string; type?: 'text' | 'product' | 'routine' | 'ar' | 'analysis' }
type Product = { id: string; name: string; price: string; image: string; category: string; productId?: string }

const SAMPLE_PRODUCTS: Product[] = [
	{ id: '1', name: 'Rose Pink Lipstick', price: '₹540', image: '/lipstick.jpg', category: 'lipstick' },
	{ id: '2', name: 'Organic Foundation', price: '₹650', image: '/foundation.webp', category: 'foundation' },
	{ id: '3', name: 'Hydrating Serum', price: '₹835', image: '/serum.jpg', category: 'skincare' },
	{ id: '4', name: 'Velvet Blush Stain', price: '₹560', image: '/blush.jpg', category: 'makeup' },
	{ id: '5', name: 'Precision Eyeliner Pen', price: '₹490', image: '/eyeliner.jpg', category: 'eyeliner' },
	{ id: '6', name: 'Cooling Sunscreen Mist', price: '₹940', image: '/sunscreen.jpg', category: 'skincare' },
	{ id: '7', name: 'Organic Eyeshadow', price: '₹425', image: '/eyeshadow.jpg', category: 'eyeshadow' },
	{ id: '8', name: 'Matcha Scalp Cleanser', price: '₹610', image: '/shampoo.jpg', category: 'haircare' }
]

const TUTORIAL_VIDEOS = {
	'lipstick': 'https://youtube.com/watch?v=lipstick-tutorial',
	'eyeshadow': 'https://youtube.com/watch?v=eyeshadow-tutorial', 
	'foundation': 'https://youtube.com/watch?v=foundation-tutorial',
	'mascara': 'https://youtube.com/watch?v=mascara-tutorial',
	'eyeliner': 'https://youtube.com/watch?v=eyeliner-tutorial'
}

const MOOD_LOOKS = {
	party: { name: 'Party Glam', description: 'Bold eyes, statement lips, glowing skin', products: ['Gold Eyeshadow', 'Rose Lipstick'] },
	office: { name: 'Professional', description: 'Natural makeup, subtle enhancement', products: ['Fair Foundation', 'Nude Lipstick'] },
	wedding: { name: 'Bridal Elegance', description: 'Soft, romantic, long-lasting', products: ['Fair Foundation', 'Rose Lipstick', 'Gold Eyeshadow'] },
	casual: { name: 'Everyday Fresh', description: 'Light coverage, natural glow', products: ['BB Cream', 'Tinted Lip Balm'] }
}

export default function ChatbotWidget() {
	const [open, setOpen] = useState(false)
	const [messages, setMessages] = useState<Message[]>([
		{ id: 'm0', role: 'bot', text: TRANSLATIONS.en.welcome }
	])
	const [input, setInput] = useState('')
	const [currentLanguage, setCurrentLanguage] = useState<Language>('en')
	const [isListening, setIsListening] = useState(false)
	const [isSpeaking, setIsSpeaking] = useState(false)
	const [showLanguageSelector, setShowLanguageSelector] = useState(false)
	const [userContext, setUserContext] = useState<UserContext>({})
	const [catalogProducts, setCatalogProducts] = useState<any[]>([])
	const { isAuthenticated } = useAuth()
	const { addItem } = useCart()
	useEffect(() => {
		axios
			.get('/api/products')
			.then((response) => {
				if (Array.isArray(response.data)) {
					setCatalogProducts(response.data)
				}
			})
			.catch((error) => console.error('Failed to load product catalog for assistant', error))
	}, [])
	const listRef = useRef<HTMLDivElement>(null)
	const recognitionRef = useRef<SpeechRecognition | null>(null)
	const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

	// Voice input/output functions
	function initializeSpeechRecognition() {
		if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
			console.warn('Speech recognition not supported')
			return false
		}

		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
		recognitionRef.current = new SpeechRecognition()
		recognitionRef.current.continuous = false
		recognitionRef.current.interimResults = false
		recognitionRef.current.lang = getLanguageCode(currentLanguage)

		recognitionRef.current.onstart = () => {
			setIsListening(true)
		}

		recognitionRef.current.onresult = (event) => {
			const transcript = event.results[0][0].transcript
			setInput(transcript)
			setIsListening(false)
		}

		recognitionRef.current.onerror = () => {
			setIsListening(false)
		}

		recognitionRef.current.onend = () => {
			setIsListening(false)
		}

		return true
	}

	function startVoiceInput() {
		if (!recognitionRef.current) {
			if (!initializeSpeechRecognition()) {
				alert('Voice input not supported in this browser')
				return
			}
		}
		recognitionRef.current?.start()
	}

	function speakText(text: string) {
		if (!('speechSynthesis' in window)) {
			console.warn('Speech synthesis not supported')
			return
		}

		// Stop any ongoing speech
		window.speechSynthesis.cancel()

		const utterance = new SpeechSynthesisUtterance(text)
		utterance.lang = getLanguageCode(currentLanguage)
		utterance.rate = 0.9
		utterance.pitch = 1.0
		utterance.volume = 0.8

		utterance.onstart = () => setIsSpeaking(true)
		utterance.onend = () => setIsSpeaking(false)
		utterance.onerror = () => setIsSpeaking(false)

		synthesisRef.current = utterance
		window.speechSynthesis.speak(utterance)
	}

	function stopSpeaking() {
		window.speechSynthesis.cancel()
		setIsSpeaking(false)
	}

	function getLanguageCode(lang: Language): string {
		const languageCodes: Record<Language, string> = {
			en: 'en-US',
			hi: 'hi-IN',
			ta: 'ta-IN',
			te: 'te-IN',
			bn: 'bn-IN',
			gu: 'gu-IN',
			kn: 'kn-IN',
			ml: 'ml-IN',
			mr: 'mr-IN',
			pa: 'pa-IN',
			ur: 'ur-PK'
		}
		return languageCodes[lang]
	}

	function detectLanguage(text: string): Language {
		// Dynamic language detection with improved patterns
		for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
			if (pattern.test(text)) {
				return lang as Language
			}
		}
		
		// Fallback: check for common words in different languages
		const lowerText = text.toLowerCase()
		if (lowerText.includes('नमस्ते') || lowerText.includes('हैं')) return 'hi'
		if (lowerText.includes('வணக்கம்') || lowerText.includes('உங்கள்')) return 'ta'
		if (lowerText.includes('नमस्कार') || lowerText.includes('आपका')) return 'hi'
		
		return 'en' // Default to English
	}

	function analyzeUserContext(text: string): Partial<UserContext> {
		const lower = text.toLowerCase()
		const context: Partial<UserContext> = {}
		
		// Detect skin type mentions
		if (lower.includes('oily') || lower.includes('greasy')) context.skinType = 'oily'
		else if (lower.includes('dry') || lower.includes('flaky')) context.skinType = 'dry'
		else if (lower.includes('combination')) context.skinType = 'combination'
		else if (lower.includes('sensitive') || lower.includes('irritated')) context.skinType = 'sensitive'
		else if (lower.includes('normal')) context.skinType = 'normal'
		
		// Detect skin tone
		if (lower.includes('fair') || lower.includes('light')) context.skinTone = 'fair'
		else if (lower.includes('medium') || lower.includes('wheatish')) context.skinTone = 'medium'
		else if (lower.includes('dark') || lower.includes('deep')) context.skinTone = 'dark'
		else if (lower.includes('olive')) context.skinTone = 'olive'
		
		// Detect budget preferences
		if (lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable')) {
			context.preferences = { ...context.preferences, budget: 'low' }
		} else if (lower.includes('expensive') || lower.includes('premium') || lower.includes('luxury')) {
			context.preferences = { ...context.preferences, budget: 'high' }
		} else if (lower.includes('mid') || lower.includes('moderate')) {
			context.preferences = { ...context.preferences, budget: 'medium' }
		}
		
		// Detect finish preferences
		if (lower.includes('matte')) context.preferences = { ...context.preferences, finish: 'matte' }
		else if (lower.includes('glossy') || lower.includes('shiny')) context.preferences = { ...context.preferences, finish: 'glossy' }
		else if (lower.includes('shimmer') || lower.includes('sparkle')) context.preferences = { ...context.preferences, finish: 'shimmer' }
		else if (lower.includes('natural')) context.preferences = { ...context.preferences, finish: 'natural' }
		
		// Detect occasion
		if (lower.includes('party') || lower.includes('night')) context.preferences = { ...context.preferences, occasion: 'party' }
		else if (lower.includes('office') || lower.includes('work') || lower.includes('professional')) context.preferences = { ...context.preferences, occasion: 'office' }
		else if (lower.includes('wedding') || lower.includes('bridal')) context.preferences = { ...context.preferences, occasion: 'wedding' }
		else if (lower.includes('casual') || lower.includes('everyday')) context.preferences = { ...context.preferences, occasion: 'casual' }
		
		// Detect mood
		if (lower.includes('happy') || lower.includes('excited')) context.mood = 'happy'
		else if (lower.includes('confident') || lower.includes('bold')) context.mood = 'confident'
		else if (lower.includes('tired') || lower.includes('exhausted')) context.mood = 'tired'
		else if (lower.includes('professional') || lower.includes('formal')) context.mood = 'professional'
		
		return context
	}

	function updateUserContext(newContext: Partial<UserContext>) {
		setUserContext(prev => ({ ...prev, ...newContext }))
	}

	function getDynamicRecommendations(context: UserContext): string {
		let recommendations = ''
		
		// Dynamic product filtering based on context
		let filteredProducts = SAMPLE_PRODUCTS
		
		if (context.preferences?.budget === 'low') {
			filteredProducts = SAMPLE_PRODUCTS.filter(p => parseInt(p.price.replace('₹', '')) < 500)
		} else if (context.preferences?.budget === 'high') {
			filteredProducts = SAMPLE_PRODUCTS.filter(p => parseInt(p.price.replace('₹', '')) > 600)
		}
		
		if (context.skinType === 'oily') {
			filteredProducts = filteredProducts.filter(p => 
				p.category === 'foundation' || p.category === 'skincare'
			)
		}
		
		if (context.preferences?.occasion === 'party') {
			filteredProducts = filteredProducts.filter(p => 
				p.category === 'lipstick' || p.category === 'eyeshadow' || p.category === 'highlighter'
			)
		}
		
		recommendations = `Based on your preferences, here are my recommendations:\n${filteredProducts.map(p => `• ${p.name} - ${p.price}`).join('\n')}`
		
		return recommendations
	}

	function translateText(text: string, targetLang: Language): string {
		// Simple translation mapping for common beauty terms
		const translationMap: Record<string, Record<Language, string>> = {
			'lipstick': {
				en: 'lipstick', hi: 'लिपस्टिक', ta: 'லிப்ஸ்டிக்', te: 'లిప్స్టిక్',
				bn: 'লিপস্টিক', gu: 'લિપસ્ટિક', kn: 'ಲಿಪ್ಸ್ಟಿಕ್', ml: 'ലിപ്സ്റ്റിക്ക്',
				mr: 'लिपस्टिक', pa: 'ਲਿਪਸਟਿਕ', ur: 'لپ اسٹک'
			},
			'foundation': {
				en: 'foundation', hi: 'फाउंडेशन', ta: 'பவுண்டேஷன்', te: 'ఫౌండేషన్',
				bn: 'ফাউন্ডেশন', gu: 'ફાઉન્ડેશન', kn: 'ಫೌಂಡೇಶನ್', ml: 'ഫൗണ്ടേഷൻ',
				mr: 'फाउंडेशन', pa: 'ਫਾਉਂਡੇਸ਼ਨ', ur: 'فاؤنڈیشن'
			},
			'eyeshadow': {
				en: 'eyeshadow', hi: 'आईशैडो', ta: 'ஐஷாடோ', te: 'ఐషాడో',
				bn: 'আইশ্যাডো', gu: 'આઈશેડો', kn: 'ಐಶ್ಯಾಡೋ', ml: 'ഐഷാഡോ',
				mr: 'आईशैडो', pa: 'ਆਈਸ਼ੈਡੋ', ur: 'آئی شیڈو'
			}
		}

		// For now, return original text with basic language-specific responses
		if (targetLang === 'hi') {
			return text.replace(/lipstick/gi, 'लिपस्टिक').replace(/foundation/gi, 'फाउंडेशन')
		} else if (targetLang === 'ta') {
			return text.replace(/lipstick/gi, 'லிப்ஸ்டிக்').replace(/foundation/gi, 'பவுண்டேஷன்')
		}
		return text
	}

	// Helper functions for beauty assistant
	function extractProductFromQuery(query: string): string | null {
		const lower = query.toLowerCase()
		for (const [product, _] of Object.entries(TUTORIAL_VIDEOS)) {
			if (lower.includes(product)) return product
		}
		return null
	}

	function findProductInQuery(query: string): Product | null {
		const lower = query.toLowerCase()
		return SAMPLE_PRODUCTS.find(p => 
			lower.includes(p.name.toLowerCase()) || 
			lower.includes(p.category.toLowerCase())
		) || null
	}


	useEffect(() => {
		if (!listRef.current) return
		listRef.current.scrollTop = listRef.current.scrollHeight
	}, [messages, open])

	const handleSend = () => {
		const text = input.trim()
		if (!text) return
		
		// Dynamic language detection and switching
		const detectedLang = detectLanguage(text)
		if (detectedLang !== currentLanguage) {
			setCurrentLanguage(detectedLang)
			// Update user context with language preference
			updateUserContext({ language: detectedLang })
		}
		
		// Dynamic context analysis
		const newContext = analyzeUserContext(text)
		updateUserContext(newContext)
		
		const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text }
		setMessages(prev => [...prev, userMsg])
		
		// Dynamic AI Beauty Assistant Logic
		const response = generateDynamicBeautyResponse(text, { ...userContext, ...newContext })
		const translatedResponse = translateText(response.text, detectedLang)
		const botMsg: Message = { 
			id: crypto.randomUUID(), 
			role: 'bot', 
			text: translatedResponse, 
			type: response.type 
		}
		setMessages(prev => [...prev, botMsg])
		
		// Dynamic voice output with language switching
		speakText(translatedResponse)
		setInput('')
	}

	function generateDynamicBeautyResponse(input: string, context: UserContext): { text: string; type: 'text' | 'product' | 'routine' | 'ar' } {
		const lower = input.toLowerCase()
		
		// Dynamic context-aware responses
		let response = ''
		let type: 'text' | 'product' | 'routine' | 'ar' = 'text'
		
		// 1. Dynamic Skin Analysis with Context
		if (lower.includes('skin') || lower.includes('analyze') || lower.includes('acne') || lower.includes('dark circles')) {
			if (context.skinType) {
				response = `🔍 **Personalized Skin Analysis for ${context.skinType} skin**\n\n`
				if (context.skinType === 'oily') {
					response += "I'll focus on oil control and pore-minimizing products. "
				} else if (context.skinType === 'dry') {
					response += "I'll prioritize hydration and moisture-locking products. "
				} else if (context.skinType === 'sensitive') {
					response += "I'll recommend gentle, fragrance-free formulations. "
				}
				response += "Click 'Start Skin Analysis' for detailed camera-based assessment!"
			} else {
				response = "🔍 **Dynamic Skin Analysis Ready!**\n\nI'll analyze your skin tone, detect issues, and provide personalized recommendations. Click 'Start Skin Analysis' to begin!"
			}
			type = 'ar'
		}
		
		// 2. Dynamic Product Recommendations with Context
		else if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('what should i use')) {
			if (context.preferences?.budget || context.skinType || context.preferences?.occasion) {
				response = getDynamicRecommendations(context)
				type = 'product'
			} else {
				response = "✨ **Dynamic Product Recommendations**\n\nI can suggest products based on your skin type, budget, and preferences. Tell me more about what you're looking for!"
				type = 'product'
			}
		}
		
		// 3. Dynamic Shopping Integration
		else if (lower.includes('like') || lower.includes('want') || lower.includes('shade') || lower.includes('buy')) {
			const product = findProductInQuery(input)
			if (product) {
				response = `🛍️ **Found: ${product.name}**\n\n**Price:** ${product.price}\n**Category:** ${product.category}\n\nPerfect choice! This product will look great on you. Click 'Add to Cart' to purchase!`
				type = 'product'
			} else {
				response = "🛍️ **Dynamic Shopping Assistant**\n\nI can help you find products based on your preferences. What specific product or shade are you looking for?"
				type = 'product'
			}
		}
		
		// 4. Dynamic AR Try-On with Context
		else if (lower.includes('try on') || lower.includes('ar') || lower.includes('virtual') || lower.includes('camera')) {
			if (context.preferences?.occasion) {
				const occasion = context.preferences.occasion
				response = `🎨 **Dynamic AR Try-On for ${occasion} look**\n\n`
				if (occasion === 'party') {
					response += "I'll help you try bold lipstick shades, glitter eyeshadow, and highlighter for a glamorous party look!"
				} else if (occasion === 'office') {
					response += "I'll show you professional makeup with natural foundation, subtle eyeshadow, and nude lipstick!"
				} else if (occasion === 'wedding') {
					response += "I'll help you try romantic, long-lasting makeup perfect for your special day!"
				}
				response += "\n\nClick 'Open AR Mode' to start your virtual makeover!"
			} else {
				response = "🎨 **Dynamic Virtual Try-On**\n\nI can help you test lipstick, eyeshadow, foundation, and more with AR filters. Click 'Open AR Mode' to start!"
			}
			type = 'ar'
		}
		
		// 5. Dynamic Mood-Based Suggestions
		else if (lower.includes('mood') || lower.includes('feeling') || lower.includes('occasion')) {
			if (context.mood) {
				response = `💫 **Dynamic ${context.mood.charAt(0).toUpperCase() + context.mood.slice(1)} Look**\n\n`
				if (context.mood === 'happy') {
					response += "I'll suggest bright, cheerful colors like coral lipstick and golden eyeshadow!"
				} else if (context.mood === 'confident') {
					response += "I'll recommend bold, statement-making products like red lipstick and dramatic eyeshadow!"
				} else if (context.mood === 'professional') {
					response += "I'll suggest polished, workplace-appropriate makeup with neutral tones!"
				}
				response += "\n\nClick 'Open AR Mode' to try this look virtually!"
			} else {
				response = "💫 **Dynamic Mood-Based Suggestions**\n\nTell me how you're feeling today, and I'll suggest the perfect makeup look for your mood!"
			}
			type = 'ar'
		}
		
		// 6. Dynamic Tutorial System
		else if (lower.includes('how to apply') || lower.includes('tutorial') || lower.includes('how do i')) {
			const product = extractProductFromQuery(input)
			if (product && TUTORIAL_VIDEOS[product as keyof typeof TUTORIAL_VIDEOS]) {
				response = `💄 **Dynamic Tutorial: How to Apply ${product.charAt(0).toUpperCase() + product.slice(1)}**\n\n`
				if (context.skinType) {
					response += `For your ${context.skinType} skin, here's the perfect technique:\n\n`
				}
				response += `**Step-by-Step Guide:**\n1. Prep your skin with moisturizer\n2. Use clean brushes or fingers\n3. Apply in thin layers\n4. Blend well for natural finish\n5. Set with setting spray\n\n**📹 Tutorial Video:** ${TUTORIAL_VIDEOS[product as keyof typeof TUTORIAL_VIDEOS]}`
			} else {
				response = "💄 **Dynamic Tutorial System**\n\nI can provide step-by-step tutorials for any beauty product. What would you like to learn how to apply?"
			}
			type = 'text'
		}
		
		// 7. Dynamic Routine Generator
		else if (lower.includes('routine') || lower.includes('beauty routine') || lower.includes('skincare routine')) {
			if (context.skinType) {
				response = `📋 **Dynamic Beauty Routine for ${context.skinType} skin**\n\n`
				if (context.skinType === 'oily') {
					response += "**Morning Routine:**\n• Oil-free cleanser\n• Salicylic acid toner\n• Oil-free moisturizer with SPF\n• Mattifying primer\n\n**Evening Routine:**\n• Deep cleansing\n• Clay mask (2x/week)\n• Lightweight moisturizer\n• Spot treatment for breakouts"
				} else if (context.skinType === 'dry') {
					response += "**Morning Routine:**\n• Gentle cleanser\n• Hyaluronic acid serum\n• Rich moisturizer\n• SPF protection\n\n**Evening Routine:**\n• Hydrating cleanser\n• Night cream\n• Face oil (optional)\n• Weekly hydrating mask"
				}
				response += "\n\nThis routine is tailored specifically for your skin type!"
			} else {
				response = "📋 **Dynamic Beauty Routine Generator**\n\nI'll create a personalized routine based on your skin type and preferences. What's your skin type?"
			}
			type = 'routine'
		}
		
		// Default dynamic response
		else {
			const responses = [
				"Hi! I'm your Dynamic AI Beauty Assistant! 💄 I adapt to your preferences and provide personalized recommendations. What would you like to explore today?",
				"Hello! ✨ I'm here to help with all your beauty needs. I'll adjust my suggestions based on your skin type, budget, and preferences!",
				"Hey there! 🌸 I can assist with skincare advice, makeup tips, and product recommendations that adapt to your unique needs. What can I help you with today?"
			]
			response = responses[Math.floor(Math.random() * responses.length)]
		}
		
		return { text: response, type }
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') handleSend()
	}

	async function resolveProductIdByName(name: string) {
		const normalized = name.toLowerCase()
		const catalogMatch = catalogProducts.find(
			(p: any) => typeof p?.name === 'string' && p.name.toLowerCase() === normalized
		)
		if (catalogMatch?._id) return catalogMatch._id as string

		try {
			const { data } = await axios.get('/api/products', { params: { query: name } })
			if (Array.isArray(data) && data.length > 0 && data[0]?._id) {
				setCatalogProducts(data)
				return data[0]._id as string
			}
		} catch (error) {
			console.error('Product lookup failed', error)
		}
		return null
	}

	async function handleAddToCart(product: Product) {
		if (!isAuthenticated) {
			const authMsg: Message = {
				id: crypto.randomUUID(),
				role: 'bot',
				text: 'Please login to add products to your cart.',
				type: 'text'
			}
			setMessages((prev) => [...prev, authMsg])
			return
		}

		try {
			const productId = product.productId || (await resolveProductIdByName(product.name))
			if (!productId) {
				const notFoundMsg: Message = {
					id: crypto.randomUUID(),
					role: 'bot',
					text: `I couldn't find "${product.name}" in stock right now. Please browse the shop page for similar products.`,
					type: 'text'
				}
				setMessages((prev) => [...prev, notFoundMsg])
				return
			}

			await addItem({ productId })
			const cartMsg: Message = {
				id: crypto.randomUUID(),
				role: 'bot',
				text: `🛒 Added ${product.name} to your cart! View it anytime on the Cart page.`,
				type: 'text'
			}
			setMessages((prev) => [...prev, cartMsg])
		} catch (error) {
			console.error('AI assistant addToCart failed', error)
			const errorMsg: Message = {
				id: crypto.randomUUID(),
				role: 'bot',
				text: `❌ Sorry, I couldn't add ${product.name} to your cart. Please try again.`,
				type: 'text'
			}
			setMessages((prev) => [...prev, errorMsg])
		}
	}

	async function handleStartSkinAnalysis() {
		const loadingMsg: Message = { 
			id: crypto.randomUUID(), 
			role: 'bot', 
			text: "🔍 Starting skin analysis... Please position your face in the camera view. Analyzing skin tone, texture, and detecting issues...", 
			type: 'ar' 
		}
		setMessages(prev => [...prev, loadingMsg])

		try {
			// Get the video element from the Try-On page
			const videoElement = document.querySelector('video') as HTMLVideoElement
			if (!videoElement) {
				const errorMsg: Message = { 
					id: crypto.randomUUID(), 
					role: 'bot', 
					text: "❌ Camera not found. Please make sure you're on the Try-On page with camera access enabled.", 
					type: 'text' 
				}
				setMessages(prev => [...prev, errorMsg])
				return
			}

			// Perform actual skin analysis
			const analysisResult = await skinAnalyzer.analyzeSkin(videoElement)
			
			// Create detailed analysis message
			const analysisText = `✨ **Skin Analysis Complete!**

**Skin Type:** ${analysisResult.skinType.charAt(0).toUpperCase() + analysisResult.skinType.slice(1)}
**Confidence:** ${Math.round(analysisResult.confidence * 100)}%

${analysisResult.issues.length > 0 ? 
	`**Detected Issues:** ${analysisResult.issues.join(', ')}` : 
	'**Great news!** No major skin issues detected.'}

**Recommended Products:**
${analysisResult.recommendations.products.map(product => `• ${product}`).join('\n')}

**Daily Routine:**
${analysisResult.recommendations.routine.map(step => `• ${step}`).join('\n')}

**Pro Tips:**
${analysisResult.recommendations.tips.map(tip => `• ${tip}`).join('\n')}`

			const analysisMsg: Message = { 
				id: crypto.randomUUID(), 
				role: 'bot', 
				text: analysisText, 
				type: 'analysis' 
			}
			setMessages(prev => [...prev, analysisMsg])

			// Add product recommendations
			const productMsg: Message = { 
				id: crypto.randomUUID(), 
				role: 'bot', 
				text: "🛍️ **Recommended Products for Your Skin:**", 
				type: 'product' 
			}
			setMessages(prev => [...prev, productMsg])

		} catch (error) {
			console.error('Skin analysis failed:', error)
			const errorMsg: Message = { 
				id: crypto.randomUUID(), 
				role: 'bot', 
				text: "❌ Analysis failed. Please try again or ensure good lighting and camera positioning.", 
				type: 'text' 
			}
			setMessages(prev => [...prev, errorMsg])
		}
	}

	function handleOpenAR() {
		const arMsg: Message = { 
			id: crypto.randomUUID(), 
			role: 'bot', 
			text: "AR mode activated! 🎭 You can now try on different makeup looks virtually. Try saying 'lipstick', 'eyeshadow', or 'foundation' to test specific products!", 
			type: 'ar' 
		}
		setMessages(prev => [...prev, arMsg])
	}

	return (
		<>
			<button
				aria-label={open ? 'Close chat' : 'Open chat'}
				onClick={() => setOpen(v => !v)}
				style={{
					position: 'fixed', right: 16, bottom: 16, zIndex: 2147483647,
					width: 56, height: 56, borderRadius: 28, border: '1px solid #ffc2d1',
					background: '#ffe5ec', boxShadow: '0 10px 15px rgba(255, 145, 164, 0.25)', cursor: 'pointer',
					color: '#b23a48'
				}}
			>
				{open ? '✖' : '💄'}
			</button>

			{open && (
				<div
					style={{
						position: 'fixed', right: 16, bottom: 84, width: 380, maxWidth: 'calc(100% - 32px)',
						background: '#fff0f3', border: '1px solid #ffc2d1', borderRadius: 12, boxShadow: '0 20px 25px rgba(255, 145, 164, 0.25)',
						zIndex: 2147483647, display: 'flex', flexDirection: 'column', overflow: 'hidden'
					}}
				>
					<div style={{ padding: 12, borderBottom: '1px solid #ffc2d1', background: '#ffe5ec' }}>
						<div style={{ fontWeight: 600, color: '#b23a48' }}>AI Beauty Assistant</div>
						<div style={{ fontSize: 12, color: '#b23a48' }}>Skin Analysis • AR Try-On • Shopping</div>
					</div>
					
					<div ref={listRef} style={{ padding: 12, gap: 8, display: 'flex', flexDirection: 'column', maxHeight: 400, overflowY: 'auto' }}>
						{messages.map(m => (
							<div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
								<div style={{
									maxWidth: '85%', padding: '8px 12px', borderRadius: 12,
									background: m.role === 'user' ? '#ffd6de' : '#fff',
									color: '#7a1f2b', border: '1px solid #ffc2d1',
								}}>
									<div style={{ whiteSpace: 'pre-line', lineHeight: 1.4 }}>
										{m.text}
									</div>
									{m.role === 'bot' && (
										<div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
											<button
												onClick={() => speakText(m.text)}
												disabled={isSpeaking}
												style={{
													background: isSpeaking ? '#ff6b8a' : '#ff4d6d',
													color: 'white', border: 'none', borderRadius: 4,
													padding: '4px 8px', cursor: isSpeaking ? 'not-allowed' : 'pointer',
													fontSize: 12, opacity: isSpeaking ? 0.7 : 1
												}}
												title="Listen to response"
											>
												{isSpeaking ? '🔊' : '🔊'} {isSpeaking ? 'Speaking...' : 'Listen'}
											</button>
											{isSpeaking && (
												<button
													onClick={stopSpeaking}
													style={{
														background: '#ff6b8a', color: 'white', border: 'none', borderRadius: 4,
														padding: '4px 8px', cursor: 'pointer', fontSize: 12
													}}
													title="Stop speaking"
												>
													⏹️ Stop
												</button>
											)}
										</div>
									)}
									{m.type === 'product' && (
										<div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
											{SAMPLE_PRODUCTS.slice(0, 2).map(p => (
												<button
													key={p.id}
													onClick={() => handleAddToCart(p)}
													style={{
														background: '#ff4d6d', color: 'white', border: 'none', borderRadius: 6,
														padding: '4px 8px', fontSize: 12, cursor: 'pointer'
													}}
												>
													Add {p.name}
												</button>
											))}
										</div>
									)}
									{m.type === 'analysis' && (
										<div style={{ marginTop: 8 }}>
											<button
												onClick={() => {
													const routineMsg: Message = { 
														id: crypto.randomUUID(), 
														role: 'bot', 
														text: "📋 **Personalized Beauty Routine Generated!**\n\n**Morning Routine:**\n• Gentle cleanser\n• Vitamin C serum\n• Moisturizer with SPF\n• Light makeup\n\n**Evening Routine:**\n• Makeup remover\n• Deep cleanser\n• Hydrating serum\n• Night cream\n\n**Weekly Treatments:**\n• Exfoliating mask (2x/week)\n• Hydrating mask (1x/week)\n• Eye cream daily", 
														type: 'routine' 
													}
													setMessages(prev => [...prev, routineMsg])
												}}
												style={{
													background: '#ff4d6d', color: 'white', border: 'none', borderRadius: 6,
													padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginRight: 8
												}}
											>
												Generate Routine
											</button>
											<button
												onClick={handleOpenAR}
												style={{
													background: '#ff4d6d', color: 'white', border: 'none', borderRadius: 6,
													padding: '6px 12px', fontSize: 12, cursor: 'pointer'
												}}
											>
												Try Products with AR
											</button>
										</div>
									)}
									{m.type === 'ar' && (
										<div style={{ marginTop: 8 }}>
											<button
												onClick={handleStartSkinAnalysis}
												style={{
													background: '#ff4d6d', color: 'white', border: 'none', borderRadius: 6,
													padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginRight: 8
												}}
											>
												Start Skin Analysis
											</button>
											<button
												onClick={handleOpenAR}
												style={{
													background: '#ff4d6d', color: 'white', border: 'none', borderRadius: 6,
													padding: '6px 12px', fontSize: 12, cursor: 'pointer'
												}}
											>
												Open AR Mode
											</button>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
					
					<div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #ffc2d1', background: '#fff0f3', position: 'relative' }}>
						<input
							placeholder={TRANSLATIONS[currentLanguage]?.voicePrompt || "Click the microphone to speak or type your message"}
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							style={{ flex: 1, border: '1px solid #ffc2d1', borderRadius: 8, padding: '10px 12px', background: '#fff', color: '#7a1f2b' }}
						/>
						<button 
							onClick={startVoiceInput}
							disabled={isListening}
							style={{ 
								background: isListening ? '#ff6b8a' : '#ff4d6d', 
								color: 'white', border: 'none', borderRadius: 8,
								padding: '8px 12px', cursor: isListening ? 'not-allowed' : 'pointer', 
								fontSize: 14, opacity: isListening ? 0.7 : 1
							}}
							title="Voice Input"
						>
							{isListening ? '🎤' : '🎤'}
						</button>
						<button 
							onClick={() => setShowLanguageSelector(!showLanguageSelector)}
							style={{ 
								background: '#ff4d6d', color: 'white', border: 'none', borderRadius: 8,
								padding: '8px 12px', cursor: 'pointer', fontSize: 14
							}}
							title="Select Language"
						>
							🌐
						</button>
						<button 
							className="btn btn-primary btn-sm" 
							onClick={handleSend} 
							style={{ background: '#ff4d6d', borderColor: '#ff4d6d' }}
						>
							Send
						</button>
					</div>
					
					{showLanguageSelector && (
						<div style={{
							position: 'absolute', bottom: 60, left: 12, right: 12,
							background: '#fff', border: '1px solid #ffc2d1', borderRadius: 8,
							padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000
						}}>
							<div style={{ fontSize: 12, color: '#7a1f2b', marginBottom: 8, fontWeight: 'bold' }}>
								Select Language / भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும்
							</div>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
								{Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
									<button
										key={code}
										onClick={() => {
											setCurrentLanguage(code as Language)
											setShowLanguageSelector(false)
										}}
										style={{
											background: currentLanguage === code ? '#ff4d6d' : '#f8f9fa',
											color: currentLanguage === code ? 'white' : '#7a1f2b',
											border: '1px solid #ffc2d1', borderRadius: 4,
											padding: '6px 8px', cursor: 'pointer', fontSize: 11
										}}
									>
										{name}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</>
	)
}
