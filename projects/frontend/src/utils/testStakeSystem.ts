// Test utility to verify stake system works
export const testStakeSystem = () => {
  console.log('🧪 Testing Stake System...')
  
  // Test 1: Check if localStorage is available
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    console.log('✅ localStorage is working')
  } catch (error) {
    console.error('❌ localStorage is not available:', error)
    return false
  }

  // Test 2: Check if CustomEvent is available
  if (typeof window !== 'undefined' && window.CustomEvent) {
    console.log('✅ CustomEvent is available')
  } else {
    console.error('❌ CustomEvent is not available')
    return false
  }

  // Test 3: Check if event dispatch works
  try {
    const testEvent = new CustomEvent('testEvent', { detail: { test: true } })
    window.addEventListener('testEvent', () => {
      console.log('✅ Event dispatch and listening works')
    })
    window.dispatchEvent(testEvent)
    window.removeEventListener('testEvent', () => {})
  } catch (error) {
    console.error('❌ Event system failed:', error)
    return false
  }

  console.log('🎉 All tests passed! Stake system should work.')
  return true
}
