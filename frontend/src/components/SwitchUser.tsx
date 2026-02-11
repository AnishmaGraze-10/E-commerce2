import { useState, useEffect } from 'react'
import { useUserSession } from '../context/UserSessionContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

export default function SwitchUser() {
	const { sessions, currentUserId, switchUser, removeSession } = useUserSession()
	const { user } = useAuth()
	const [isOpen, setIsOpen] = useState(false)
	const [showAddUser, setShowAddUser] = useState(false)
	const [newUserEmail, setNewUserEmail] = useState('')
	const [newUserPassword, setNewUserPassword] = useState('')

	const sessionList = Object.values(sessions).sort(
		(a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
	)

	const handleSwitch = async (userId: string) => {
		if (userId === currentUserId) {
			setIsOpen(false)
			return
		}

		try {
			await switchUser(userId)
			toast.success('Switched user successfully!')
			setIsOpen(false)
		} catch (error: any) {
			toast.error(error.message || 'Failed to switch user')
		}
	}

	const handleRemoveSession = (userId: string) => {
		if (userId === currentUserId) {
			toast.error('Cannot remove current user session. Please switch to another user first.')
			return
		}
		removeSession(userId)
		toast.success('Session removed')
	}

	const handleAddUser = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newUserEmail || !newUserPassword) {
			toast.error('Please enter email and password')
			return
		}

		try {
			// This would typically open a login modal or redirect to login
			// For now, we'll just show a message
			toast.info('Please use the login page to add a new user session')
			setShowAddUser(false)
			setNewUserEmail('')
			setNewUserPassword('')
		} catch (error: any) {
			toast.error(error.message || 'Failed to add user')
		}
	}

	if (!user) {
		return null
	}

	return (
		<div className="position-relative">
			<button
				className="btn btn-sm btn-outline-secondary"
				onClick={() => setIsOpen(!isOpen)}
				title="Switch User"
			>
				👤 Switch User {sessionList.length > 1 && `(${sessionList.length})`}
			</button>

			{isOpen && (
				<>
					<div
						className="position-fixed top-0 start-0 w-100 h-100"
						style={{ zIndex: 1040 }}
						onClick={() => setIsOpen(false)}
					/>
					<div
						className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg p-3"
						style={{ zIndex: 1050, minWidth: '300px', maxWidth: '400px', maxHeight: '500px', overflowY: 'auto' }}
					>
						<div className="d-flex justify-content-between align-items-center mb-3">
							<h6 className="mb-0">Switch User</h6>
							<button
								className="btn-close"
								onClick={() => setIsOpen(false)}
								aria-label="Close"
							/>
						</div>

						{sessionList.length === 0 ? (
							<p className="text-muted mb-0">No user sessions available</p>
						) : (
							<div className="list-group mb-3">
								{sessionList.map((session) => (
									<div
										key={session.userId}
										className={`list-group-item d-flex justify-content-between align-items-center ${
											session.userId === currentUserId ? 'active' : ''
										}`}
									>
										<div className="flex-grow-1">
											<div className="fw-bold">{session.name}</div>
											<small className="text-muted">{session.email}</small>
											{session.userId === currentUserId && (
												<div>
													<small className="badge bg-primary">Current</small>
												</div>
											)}
										</div>
										<div className="d-flex gap-2">
											{session.userId !== currentUserId && (
												<button
													className="btn btn-sm btn-primary"
													onClick={() => handleSwitch(session.userId)}
												>
													Switch
												</button>
											)}
											{sessionList.length > 1 && (
												<button
													className="btn btn-sm btn-outline-danger"
													onClick={() => handleRemoveSession(session.userId)}
													disabled={session.userId === currentUserId}
												>
													Remove
												</button>
											)}
										</div>
									</div>
								))}
							</div>
						)}

						<div className="d-flex justify-content-between">
							<button
								className="btn btn-sm btn-outline-primary"
								onClick={() => {
									setShowAddUser(!showAddUser)
									setNewUserEmail('')
									setNewUserPassword('')
								}}
							>
								{showAddUser ? 'Cancel' : '+ Add User'}
							</button>
							<button
								className="btn btn-sm btn-secondary"
								onClick={() => setIsOpen(false)}
							>
								Close
							</button>
						</div>

						{showAddUser && (
							<div className="mt-3 p-3 border rounded">
								<p className="small text-muted mb-2">
									To add a new user, please use the login page. After logging in, the session will be automatically saved.
								</p>
								<a href="/login" className="btn btn-sm btn-primary w-100">
									Go to Login
								</a>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}

