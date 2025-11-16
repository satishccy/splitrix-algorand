"use client"

import { useState, useRef, useEffect } from "react"
import { X, QrCode, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@txnlab/use-wallet-react"
import { useFriends } from "@/contexts/FriendsContext"
import algosdk from "algosdk"
import { Html5Qrcode } from "html5-qrcode"

interface AddFriendModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddFriendModal({ isOpen, onClose, onSuccess }: AddFriendModalProps) {
  const { activeAccount } = useWallet()
  const { addFriend } = useFriends()
  const [method, setMethod] = useState<"qr" | "manual">("manual")
  const [scannedData, setScannedData] = useState("")
  const [friendAddress, setFriendAddress] = useState("")
  const [nickname, setNickname] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scannedSuccessfully, setScannedSuccessfully] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")
  const qrCodeRef = useRef<Html5Qrcode | null>(null)
  const qrCodeRegionId = "qr-reader"

  useEffect(() => {
    if (!isOpen) {
      stopQRScanning()
      return
    }

    if (method === "qr" && isOpen) {
      // Don't auto-start, let user click button
    } else {
      stopQRScanning()
    }

    return () => {
      stopQRScanning()
    }
  }, [method, isOpen])

  const validateAlgorandAddress = (address: string): boolean => {
    try {
      if (address.length !== 58) return false
      return algosdk.isValidAddress(address)
    } catch {
      return false
    }
  }

  const startQRScanning = async () => {
    try {
      setError("")
      setIsScanning(true)
      
      // Clear any existing scanner
      if (qrCodeRef.current) {
        try {
          await qrCodeRef.current.stop()
          await qrCodeRef.current.clear()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      const html5QrCode = new Html5Qrcode(qrCodeRegionId)
      qrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // QR code scanned successfully
          if (validateAlgorandAddress(decodedText)) {
            setScannedData(decodedText)
            setScannedSuccessfully(true)
            stopQRScanning()
          } else {
            setError('Scanned QR code does not contain a valid Algorand address')
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent during scanning)
          // Only log if it's not a "NotFoundException" (normal during scanning)
          if (!errorMessage.includes("NotFoundException")) {
            console.debug('QR scan error:', errorMessage)
          }
        }
      )
    } catch (err: any) {
      console.error('Error starting QR scanner:', err)
      setError(err.message || 'Failed to start camera. Please ensure camera permissions are granted.')
      setIsScanning(false)
      qrCodeRef.current = null
    }
  }

  const stopQRScanning = async () => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.stop()
        await qrCodeRef.current.clear()
      } catch (err) {
        console.error('Error stopping QR scanner:', err)
      }
      qrCodeRef.current = null
    }
    setIsScanning(false)
  }

  const handleManualEntry = () => {
    stopQRScanning()
    setMethod("manual")
  }

  const handleAddFriend = async () => {
    if (!activeAccount?.address) {
      setError('Please connect your wallet first')
      return
    }

    const addressToAdd = method === "qr" ? scannedData : friendAddress.trim()
    if (!addressToAdd) {
      setError('Please provide a friend address')
      return
    }

    // Validate Algorand address format
    if (!validateAlgorandAddress(addressToAdd)) {
      setError('Invalid Algorand address format. Address must be 58 characters.')
      return
    }

    if (addressToAdd === activeAccount.address) {
      setError('Cannot add yourself as a friend')
      return
    }

    setIsProcessing(true)
    setError("")
    try {
      await addFriend(addressToAdd, nickname.trim() || undefined)
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
      // Reset form
      setScannedData("")
      setFriendAddress("")
      setNickname("")
      setScannedSuccessfully(false)
      setError("")
    } catch (error: any) {
      setError(error.message || 'Failed to add friend')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-xl border border-border w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="text-2xl font-bold text-foreground">Add Friend</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-light rounded-lg transition-colors">
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Method Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Add Friend By</label>
            <div className="grid grid-cols-2 gap-2">
              {(["qr", "manual"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMethod(m)
                    setError("")
                    if (m === "manual") {
                      stopQRScanning()
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    method === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-light border border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {m === "qr" ? "QR Code" : "Manual Entry"}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2">
              <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Manual Entry Fields */}
          {method === "manual" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Algorand Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Algorand wallet address (58 characters)"
                  value={friendAddress}
                  onChange={(e) => {
                    setFriendAddress(e.target.value)
                    setError("")
                  }}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary font-mono text-sm"
                  maxLength={58}
                />
                {friendAddress && !validateAlgorandAddress(friendAddress) && (
                  <p className="text-xs text-destructive mt-1">Invalid address format</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nickname (optional)</label>
                <input
                  type="text"
                  placeholder="Enter a nickname for this friend"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          {/* QR Code Scanning */}
          {method === "qr" && (
            <div className="space-y-4">
              {!scannedSuccessfully ? (
                <>
                  <div className="relative rounded-lg bg-surface-light border border-border overflow-hidden">
                    <div 
                      id={qrCodeRegionId} 
                      className="w-full aspect-square"
                      style={{ minHeight: '300px', maxHeight: '400px' }}
                    ></div>
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-surface/90 backdrop-blur-sm z-10">
                        <div className="text-center p-4">
                          <QrCode size={48} className="mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-4">Camera not started</p>
                          <Button 
                            onClick={startQRScanning}
                            className="bg-primary hover:bg-primary-dark text-primary-foreground"
                          >
                            <QrCode size={18} className="mr-2" />
                            Start Camera
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  {isScanning && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground text-center">
                        Position QR code within the frame
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleManualEntry}
                          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          Enter Manually
                        </Button>
                        <Button 
                          onClick={stopQRScanning}
                          className="flex-1 bg-surface-light hover:bg-surface border border-border text-foreground"
                        >
                          Stop Camera
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-success/20">
                      <Check size={20} className="text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-success">Address Ready!</p>
                      <p className="text-xs text-muted-foreground">Friend's wallet address detected</p>
                    </div>
                  </div>
                  <div className="p-3 rounded bg-surface-light border border-border mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Address:</p>
                    <p className="text-sm font-mono text-foreground break-all">{scannedData}</p>
                    {validateAlgorandAddress(scannedData) ? (
                      <p className="text-xs text-success mt-1">✓ Valid address</p>
                    ) : (
                      <p className="text-xs text-destructive mt-1">✗ Invalid address format</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Nickname (optional)</label>
                    <input
                      type="text"
                      placeholder="Enter a nickname for this friend"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                      maxLength={50}
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      setScannedSuccessfully(false)
                      setScannedData("")
                      setNickname("")
                      setError("")
                      startQRScanning()
                    }}
                    className="w-full mt-3 bg-surface-light hover:bg-surface border border-border text-foreground"
                  >
                    Scan Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border flex-shrink-0">
            <Button
              onClick={() => {
                stopQRScanning()
                onClose()
              }}
              className="flex-1 bg-surface-light hover:bg-surface border border-border text-foreground"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddFriend}
              disabled={
                (method === "qr" && (!scannedSuccessfully || !validateAlgorandAddress(scannedData))) || 
                (method === "manual" && (!friendAddress || !validateAlgorandAddress(friendAddress))) || 
                isProcessing || 
                !activeAccount
              }
              className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                  Adding...
                </div>
              ) : (
                'Add Friend'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
