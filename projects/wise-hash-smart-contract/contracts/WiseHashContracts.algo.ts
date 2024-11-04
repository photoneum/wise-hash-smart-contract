import { Contract } from '@algorandfoundation/tealscript';

// Define contract state type
type ContractState = 'new' | 'started' | 'complete';

export class WiseHashContracts extends Contract {
  // Global state variables
  supplyChainId = GlobalStateKey<string>();
  ownerAddress = GlobalStateKey<Address>();
  location = GlobalStateKey<string>();
  timestamp = GlobalStateKey<uint64>();
  contractState = GlobalStateKey<ContractState>();

  /**
   * Begins a new supply chain
   * @param supplyChainId - Unique identifier for the supply chain
   * @param location - Current location of the goods
   */
  beginSupplyChain(supplyChainId: string, location: string): void {
    // Verify contract is not already in use
    assert(!this.contractState.exists || this.contractState.value === 'new', 'Contract already in use');

    // Store initial supply chain details
    this.supplyChainId.value = supplyChainId;
    this.ownerAddress.value = this.txn.sender;
    this.location.value = location;
    this.timestamp.value = this.txn.timestamp;
    this.contractState.value = 'started';
  }

  /**
   * Exchanges the supply chain ownership to a new address
   * @param supplyChainId - Supply chain identifier to verify
   * @param receiverAddress - New owner address
   * @param location - Current location of the goods
   */
  exchangeSupplyChain(supplyChainId: string, receiverAddress: Address, location: string): void {
    // Verify sender is current owner
    assert(this.ownerAddress.value === this.txn.sender, 'Only current owner can exchange');

    // Verify supply chain ID matches
    assert(this.supplyChainId.value === supplyChainId, 'Supply chain ID mismatch');

    // Verify contract is in started state
    assert(this.contractState.value === 'started', 'Supply chain not in valid state');

    // Update ownership and details
    this.ownerAddress.value = receiverAddress;
    this.location.value = location;
    this.timestamp.value = this.txn.timestamp;
  }

  /**
   * Completes the supply chain process
   * @param supplyChainId - Supply chain identifier to verify
   * @param receiverAddress - Final receiver address
   * @param location - Final location of the goods
   */
  completeSupplyChain(supplyChainId: string, receiverAddress: Address, location: string): void {
    // Verify sender is current owner
    assert(this.ownerAddress.value === this.txn.sender, 'Only current owner can complete');

    // Verify supply chain ID matches
    assert(this.supplyChainId.value === supplyChainId, 'Supply chain ID mismatch');

    // Verify contract is in started state
    assert(this.contractState.value === 'started', 'Supply chain not in valid state');

    // Update final details
    this.ownerAddress.value = receiverAddress;
    this.location.value = location;
    this.timestamp.value = this.txn.timestamp;
    this.contractState.value = 'complete';
  }

  /**
   * Gets the current state of the supply chain
   * @returns Object containing current supply chain details
   */
  getSupplyChainState(): {
    supplyChainId: string;
    ownerAddress: Address;
    location: string;
    timestamp: uint64;
    state: ContractState;
  } {
    return {
      supplyChainId: this.supplyChainId.value,
      ownerAddress: this.ownerAddress.value,
      location: this.location.value,
      timestamp: this.timestamp.value,
      state: this.contractState.value,
    };
  }
}
