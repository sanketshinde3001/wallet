import WalletConnect from '@/components/WalletConnect'
import SendCrypto from '@/components/SendCrypto'

export default function Home() {
  return (
    <main className="min-h-screen p-24 bg-gray-50">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Crypto Wallet</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WalletConnect />
          <SendCrypto />
        </div>
      </div>
    </main>
  )
}