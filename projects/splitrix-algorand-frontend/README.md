# 🚀 Splitrix - Web3 Expense Management dApp
  
  **Split. Invest. Enjoy. Repeat.**
  
  A next-generation expense splitting application built on Algorand blockchain with automatic dust pool investment.
</div>

## 🌟 **Overview**

Splitrix is a Web3-powered expense management dApp that revolutionizes how friends split bills and manage group funds. Built on Algorand blockchain, it combines the convenience of traditional expense splitting with the power of decentralized finance.

### **Key Features**
- 💰 **Smart Bill Splitting** - Multiple split types with automatic dust handling
- 🏦 **Dust Pool Investment** - Auto-invest leftover crypto dust into yield farms
- 🗳️ **Democratic Voting** - Anonymous voting for group fund handlers
- 📱 **Mobile-First Design** - Responsive interface with QR code integration
- 🔗 **Web3 Integration** - Full Algorand blockchain integration
- 🎨 **Modern UI/UX** - Industrial tech aesthetic with black-yellow theme

## 🎯 **Core Concepts**

### **Smart Bill Splitting**
When friends split a bill (e.g., 10 ALGO among 3 friends):
- Each gets 3.3333 ALGO
- Remainder = 0.001 ALGO (crypto dust)
- Dust is automatically sent to a shared "Dust Investment Pool"
- Pool invests in DeFi opportunities (yield farming, lottery, donations)

### **Group Fund Management**
- Create group funds for trips, events, or shared goals
- Anonymous voting to elect fund handlers
- Transparent spending with role-based permissions
- Automatic fund distribution after completion

## 🛠️ **Tech Stack**

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Lucide React** - Beautiful icons

### **Blockchain**
- **Algorand** - Fast, secure, and carbon-negative blockchain
- **Algorand SDK** - Official JavaScript SDK
- **use-wallet** - Modern wallet integration
- **AlgoKit** - Development utilities

### **Database**
- **PostgreSQL** - Primary database (recommended)
- **SQLite** - Development database
- **MySQL** - Alternative database option

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or pnpm
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/splitrix-mvp.git
   cd splitrix-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎮 **Development Mode**

The application comes with **mock wallet integration** for easy development and testing:

### **Mock Features**
- ✅ Wallet connection simulation
- ✅ Mock transaction processing
- ✅ Dust pool calculation
- ✅ QR code generation
- ✅ Voting system simulation

### **Testing the Application**
1. **Connect Mock Wallet** - Click "Connect Wallet" in sidebar
2. **Create Test Bills** - Use small amounts (0.001 ALGO)
3. **Test QR Features** - Generate and scan mock QR codes
4. **Try Voting** - Test the democratic voting system
5. **Explore All Pages** - Dashboard, Bills, Groups, Friends, Voting, Admin, Settings

## 🔧 **Real Blockchain Integration**

When ready for real Algorand integration:

### **1. Install Real Packages**
```bash
npm install algosdk @txnlab/use-wallet
```

### **2. Set Up TestNet**
```bash
# Get TestNet ALGO from faucet
# Visit: https://testnet.algoexplorer.io/dispenser
```

### **3. Configure Environment**
```env
ALGORAND_NETWORK=testnet
ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
```

### **4. Recommended Wallets**
- **Pera Wallet** - Best for testing (mobile + browser)
- **Defly Wallet** - Advanced DeFi features
- **Exodus Wallet** - Multi-crypto support

## 📱 **Mobile Testing**

### **Using ngrok**
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL on mobile device
```

### **Mobile Features**
- QR code scanning for friend addition
- Mobile-optimized wallet connections
- Responsive design for all screen sizes

## 🗄️ **Database Setup**

### **Option 1: PostgreSQL (Recommended)**
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb splitrix_db
sudo -u postgres createuser splitrix_user

# Run schema
psql -U splitrix_user -d splitrix_db -f database/schema.sql
```

### **Option 2: SQLite (Development)**
```bash
# SQLite is automatically set up
# Database file: splitrix.db
```

### **Option 3: MySQL**
```bash
# Install MySQL
sudo apt install mysql-server

# Create database
mysql -u root -p
CREATE DATABASE splitrix_db;
CREATE USER 'splitrix_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON splitrix_db.* TO 'splitrix_user'@'localhost';
```

## 🎨 **Design System**

### **Color Palette**
- **Primary**: `#ffd300` (Golden Yellow)
- **Background**: `#0d0d0d` (Deep Black)
- **Accent**: `#00d9ff` (Cyan Blue)
- **Surface**: `#1a1a1a` (Dark Gray)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Destructive**: `#ef4444` (Red)

### **Typography**
- **Font Family**: Geist (Sans) + Geist Mono
- **Weights**: 400, 500, 600, 700
- **Responsive**: Mobile-first approach

### **Components**
- Glass morphism effects
- Smooth animations
- Hover states and transitions
- Loading states and feedback

## 📊 **Features Overview**

### **Dashboard**
- Balance overview with "You Owe" / "You Are Owed" tracking
- Dust Pool Widget showing accumulated crypto dust
- Recent transactions display
- Quick actions for common tasks

### **Bills Management**
- Create bills with multiple split types (equal, custom, percentage, itemized)
- Bill categorization (Food, Entertainment, Travel, etc.)
- Receipt/image upload support
- Filter by status (pending, settled)

### **Groups & Fund Management**
- Two group types: Expense Groups vs Fund Groups
- Fund Groups with target amounts and voting for fund handlers
- Member management with role-based permissions
- Group fund tracking and distribution

### **Friends & Contacts**
- QR code generation for easy friend addition
- Contact management with avatars
- Search and filter capabilities
- Wallet address integration

### **Voting System**
- Anonymous voting for fund handlers
- Vote tracking and status management
- Democratic decision-making for group funds
- Address display for candidates

### **Admin Controls**
- Dust Pool Management - track and distribute accumulated dust
- Spending Limits - set and monitor user spending caps
- User Management - add/remove members, promote admins
- System Settings - configure dust pool modes (Invest/Lottery/Donate)

### **Settings & Security**
- Profile management
- Security settings with 2FA
- Wallet connection management
- Appearance and notification preferences

## 🧪 **Testing**

### **Development Testing**
```bash
# Run development server
npm run dev

# Test all features with mock data
# Verify responsive design
# Check mobile compatibility
```

### **Blockchain Testing**
```bash
# Connect real wallets
# Test with TestNet ALGO
# Verify transaction processing
# Check dust pool functionality
```

### **Database Testing**
```bash
# Test database connections
# Verify schema integrity
# Check data persistence
# Test backup and recovery
```

## 🚀 **Deployment**

### **Development**
```bash
npm run dev
```

### **Production Build**
```bash
npm run build
npm start
```

### **Environment Variables**
```env
# Production
ALGORAND_NETWORK=mainnet
ALGORAND_NODE_URL=https://mainnet-api.algonode.cloud
ALGORAND_INDEXER_URL=https://mainnet-idx.algonode.cloud

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com
```

## 📚 **Documentation**

- **[Development Setup](docs/development-setup.md)** - Complete development guide
- **[TestNet Setup](docs/testnet-setup.md)** - Algorand TestNet configuration
- **[Algorand Integration](docs/algorand-integration.md)** - Blockchain integration guide
- **[Database Schema](database/schema.sql)** - Complete database structure
- **[Sample Data](database/sample-data.sql)** - Test data for development

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Algorand Foundation** - For the amazing blockchain platform
- **Next.js Team** - For the excellent React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Radix UI** - For accessible component primitives
- **Lucide** - For beautiful icons

## 📞 **Support**

- **Documentation**: Check the `docs/` folder
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@splitrix.app

## 🎉 **Get Started**

Ready to revolutionize expense splitting with Web3? Start your journey with Splitrix today!

```bash
git clone https://github.com/yourusername/splitrix-mvp.git
cd splitrix-mvp
npm install
npm run dev
```

**Welcome to the future of expense management! 🚀**

---

<div align="center">
  <p>Built with ❤️ using Next.js, Algorand, and modern Web3 technologies</p>
  <p>© 2025 Splitrix. All rights reserved.</p>

</div>

