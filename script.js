window.userAddress = null
window.onload = async () => {
  // Init Web3 connected to ETH network
  if (!window.ethereum) {
    alert('No ETH brower extension detected.')
  }

  // Load in Localstore key
  window.userAddress = window.localStorage.getItem('userAddress')
  showAddress()
}

// Use this function to turn a 42 character ETH address
// into an address like 0x345...12345
function truncateAddress(address) {
  if (!address) {
    return ''
  }
  return `${address.substr(0, 5)}...${address.substr(
    address.length - 5,
    address.length
  )}`
}

// Display or remove the users know address on the frontend
function showAddress() {
  if (!window.userAddress) {
    document.getElementById('userAddress').innerText = ''
    document.getElementById('logoutButton').classList.add('hidden')
    return false
  }

  document.getElementById(
    'userAddress'
  ).innerText = `ETH Address: ${truncateAddress(window.userAddress)}`
  document.getElementById('logoutButton').classList.remove('hidden')
}

// remove stored user address and reset frontend
function logout() {
  window.userAddress = null
  window.localStorage.removeItem('userAddress')
  showAddress()
}

// Login with Web3 via Metamasks window.ethereum library
async function loginWithEth() {
  if (window.ethereum) {
    try {
      // We use this since ethereum.enable() is deprecated. This method is not
      // available in Web3JS - so we call it directly from metamasks' library
      const selectedAccount = await window.ethereum
        .request({
          method: 'eth_requestAccounts'
        })
        .then(accounts => accounts[0])
        .catch(() => {
          throw Error('No account selected!')
        })
      window.userAddress = selectedAccount
      window.localStorage.setItem('userAddress', selectedAccount)
      showAddress()
    } catch (error) {
      console.error(error)
    }
  } else {
    alert('No ETH brower extension detected.')
  }
}

async function getOpenseaItems() {
  if (!window.userAddress) {
    return
  }
  const osContainer = document.getElementById('openseaItems')

  const items = await fetch(`https://api.opensea.io/api/v1/assets?format=json`)
    .then(res => res.json())
    .then(res => {
      return res.assets
    })
    .catch(e => {
      console.error(e)
      console.error('Could not talk to OpenSea')
      return null
    })

  if (items.length === 0) {
    return
  }

  items.forEach(nft => {
    const { name, image_url, description, permalink } = nft

    const newElement = document.createElement('div')
    newElement.innerHTML = `
          <!-- Opensea listing item-->
          <a href='${permalink}' target="_blank">
            <div class='flex flex-col'>
              <img
                src='${image_url}'
                class='w-full rounded-lg' />
              <div class='flex-col w-full space-y-1'>
                <p class='text-white text-lg'>${name}</p>
                <p class='text-gray-500 text-xs word-wrap'>${
                  description ?? ''
                }</p>
              </div>
            </div>
          </a>
          <!-- End Opensea listing item-->
        `

    osContainer.appendChild(newElement)
  })
}
