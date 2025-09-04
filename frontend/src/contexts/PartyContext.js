import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/config';

// Create the context
const PartyContext = createContext();

// Export the context hook
export const usePartyContext = () => {
  const context = useContext(PartyContext);
  if (!context) {
    throw new Error('usePartyContext must be used within a PartyProvider');
  }
  return context;
};

// Create the provider component
export const PartyProvider = ({ children }) => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Fetch all parties
  const fetchParties = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        ...params,
        isActive: 'true' // Only fetch active parties by default
      }).toString();

      console.log('[PartyContext] Fetching parties with params:', queryParams);
      const response = await axios.get(`/parties?${queryParams}`);
      
      if (response.data.success) {
        setParties(response.data.data.parties || []);
        // Return the response data so components can get pagination info
        return response.data;
      } else {
        setError('Failed to fetch parties');
        setParties([]);
        return { success: false, message: 'Failed to fetch parties' };
      }
    } catch (error) {
      console.error('[PartyContext] Error fetching parties:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch parties';
      setError(errorMessage);
      setParties([]);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new party
  const createParty = async (partyData) => {
    try {
      console.log('[PartyContext] Creating new party:', partyData);
      const response = await axios.post('/parties', partyData);
      
      if (response.data.success) {
        // Refresh parties list
        setLastUpdated(Date.now());
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to create party' };
      }
    } catch (error) {
      console.error('[PartyContext] Error creating party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create party';
      return { success: false, error: errorMessage };
    }
  };

  // Update an existing party
  const updateParty = async (partyId, partyData) => {
    try {
      console.log('[PartyContext] Updating party:', partyId, partyData);
      const response = await axios.put(`/parties/${partyId}`, partyData);
      
      if (response.data.success) {
        // Refresh parties list
        setLastUpdated(Date.now());
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to update party' };
      }
    } catch (error) {
      console.error('[PartyContext] Error updating party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update party';
      return { success: false, error: errorMessage };
    }
  };

  // Delete a party
  const deleteParty = async (partyId) => {
    try {
      console.log('[PartyContext] Deleting party:', partyId);
      const response = await axios.delete(`/parties/${partyId}`);
      
      if (response.data.success) {
        // Refresh parties list
        setLastUpdated(Date.now());
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to delete party' };
      }
    } catch (error) {
      console.error('[PartyContext] Error deleting party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete party';
      return { success: false, error: errorMessage };
    }
  };

  // Get a single party by ID
  const getPartyById = (partyId) => {
    return parties.find(party => party.id === partyId);
  };

  // Fetch parties when the context is first loaded or when lastUpdated changes
  useEffect(() => {
    fetchParties();
  }, [fetchParties, lastUpdated]);

  // Value to be provided by the context
  const value = {
    parties,
    loading,
    error,
    fetchParties,
    createParty,
    updateParty,
    deleteParty,
    getPartyById,
    refreshParties: () => setLastUpdated(Date.now())
  };

  return (
    <PartyContext.Provider value={value}>
      {children}
    </PartyContext.Provider>
  );
};
