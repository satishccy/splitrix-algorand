"use client"

import { useState, useEffect } from "react"
import { X, Download, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@txnlab/use-wallet-react"
import QRCode from "qrcode"

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  address?: string
}

export function QrCodeModal({ isOpen, onClose, address }: QrCodeModalProps) {
  const { activeAccount } = useWallet()
  const [copied, setCopied] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState<string>("")
  
  const qrData = address || activeAccount?.address || ""

  useEffect(() => {
    if (isOpen && !qrData) {
      setCopied(false)
      setQrImageUrl("")
    }
  }, [isOpen, qrData])

  useEffect(() => {
    if (qrData && isOpen) {
      // Generate QR code as image URL
      QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then((url) => {
          setQrImageUrl(url)
        })
        .catch((err) => {
          console.error('Error generating QR code:', err)
        })
    }
  }, [qrData, isOpen])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleDownload = async () => {
    if (!qrImageUrl) return

    try {
      // Create download link from the QR code image
      const link = document.createElement('a')
      link.href = qrImageUrl
      link.download = `qr-code-${qrData.slice(0, 8)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to download QR code:', err)
    }
  }

  if (!isOpen) return null

  if (!qrData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass rounded-xl border border-border w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">Your QR Code</h2>
            <button onClick={onClose} className="p-2 hover:bg-surface-light rounded-lg transition-colors">
              <X size={24} className="text-muted-foreground" />
            </button>
          </div>
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Please connect your wallet to generate QR code</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-xl border border-border w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="text-2xl font-bold text-foreground">Your QR Code</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-light rounded-lg transition-colors">
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* QR Code Display */}
          <div className="p-6 rounded-lg bg-white flex items-center justify-center border-2 border-border">
            {qrImageUrl ? (
              <div className="flex flex-col items-center">
                <img 
                  src={qrImageUrl} 
                  alt="QR Code" 
                  className="w-64 h-64 rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Scan this QR code to add me as a friend
                </p>
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Generating QR code...</p>
                </div>
              </div>
            )}
          </div>

          {/* Address Info */}
          <div className="p-4 rounded-lg bg-surface-light border border-border">
            <p className="text-xs text-muted-foreground mb-2">Your Wallet Address</p>
            <p className="text-sm font-mono text-foreground break-all">
              {qrData}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleCopy}
              className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Address
                </>
              )}
            </Button>
            <Button 
              onClick={handleDownload}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download QR
            </Button>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Share this QR code with friends so they can add you. They can scan it or manually enter your address.
            </p>
          </div>

          {/* Close */}
          <Button
            onClick={onClose}
            className="w-full bg-surface-light hover:bg-surface border border-border text-foreground"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
