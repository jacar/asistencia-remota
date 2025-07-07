const http = require("http")

console.log("🔍 Testing RemoteConnect connections...\n")

// Test backend health
const testBackend = () => {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:3001/api/health", (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("✅ Backend server is running on http://localhost:3001")
          console.log(`   Status: ${JSON.parse(data).status}`)
          resolve(true)
        } else {
          console.log("❌ Backend server returned error:", res.statusCode)
          resolve(false)
        }
      })
    })

    req.on("error", () => {
      console.log("❌ Backend server is not running on http://localhost:3001")
      resolve(false)
    })

    req.setTimeout(5000, () => {
      console.log("❌ Backend server connection timeout")
      resolve(false)
    })
  })
}

// Test frontend
const testFrontend = () => {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:5173", (res) => {
      if (res.statusCode === 200) {
        console.log("✅ Frontend server is running on http://localhost:5173")
        resolve(true)
      } else {
        console.log("❌ Frontend server returned error:", res.statusCode)
        resolve(false)
      }
    })

    req.on("error", () => {
      console.log("❌ Frontend server is not running on http://localhost:5173")
      resolve(false)
    })

    req.setTimeout(5000, () => {
      console.log("❌ Frontend server connection timeout")
      resolve(false)
    })
  })
}

// Run tests
async function runTests() {
  const backendOk = await testBackend()
  const frontendOk = await testFrontend()

  console.log("\n📊 Connection Test Results:")
  console.log("============================")

  if (backendOk && frontendOk) {
    console.log("🎉 All servers are running correctly!")
    console.log("\n🌟 Ready to use:")
    console.log("   • Home: http://localhost:5173")
    console.log("   • Demo: http://localhost:5173/demo")
    console.log("   • API: http://localhost:3001/api/health")
  } else {
    console.log("⚠️  Some servers are not running. Please start them with:")
    console.log("   npm run dev")
  }
}

runTests()
