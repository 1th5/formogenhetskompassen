/**
 * Zustand store för lokal hantering av hushållsdata
 * Sparar data i localStorage lokalt
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Household, Person, Asset, Liability, OnboardingData } from '@/lib/types';

interface HouseholdState {
  // Draft data (sparas lokalt)
  draftHousehold: Household | null;
  
  // Actions
  setDraftHousehold: (household: Household | null) => void;
  updatePersons: (persons: Person[]) => void;
  updateAssets: (assets: Asset[]) => void;
  updateLiabilities: (liabilities: Liability[]) => void;
  clearDraft: () => void;
  
  // Onboarding helpers
  setOnboardingData: (data: OnboardingData) => void;
  getOnboardingData: () => OnboardingData;
  
  // Animation tracking
  previousLevel: number | null;
  setPreviousLevel: (level: number | null) => void;
  shouldAnimate: boolean;
  setShouldAnimate: (should: boolean) => void;
  cameFromOnboarding: boolean;
  setCameFromOnboarding: (from: boolean) => void;
  
  // Pension calculation settings
  useInflationAdjustment: boolean;
  setUseInflationAdjustment: (use: boolean) => void;
}

export const useHouseholdStore = create<HouseholdState>()(
  persist(
    (set, get) => ({
      draftHousehold: null,
      
      setDraftHousehold: (household) => {
        set({ draftHousehold: household });
      },
      
      updatePersons: (persons) => {
        const current = get().draftHousehold;
        if (current) {
          set({
            draftHousehold: {
              ...current,
              persons
            }
          });
        }
      },
      
      updateAssets: (assets) => {
        const current = get().draftHousehold;
        if (current) {
          set({
            draftHousehold: {
              ...current,
              assets
            }
          });
        }
      },
      
      updateLiabilities: (liabilities) => {
        const current = get().draftHousehold;
        if (current) {
          set({
            draftHousehold: {
              ...current,
              liabilities
            }
          });
        }
      },
      
      clearDraft: () => {
        set({ draftHousehold: null });
      },
      
      setOnboardingData: (data) => {
        const household: Household = {
          name: 'Mitt hushåll',
          persons: data.persons,
          assets: data.assets,
          liabilities: data.liabilities
        };
        set({ draftHousehold: household });
      },
      
      getOnboardingData: () => {
        const household = get().draftHousehold;
        if (!household) {
          return {
            persons: [],
            assets: [],
            liabilities: []
          };
        }
        
        return {
          persons: household.persons,
          assets: household.assets,
          liabilities: household.liabilities
        };
      },
      
      // Animation tracking
      previousLevel: null,
      setPreviousLevel: (level) => {
        set({ previousLevel: level });
      },
      shouldAnimate: false,
      setShouldAnimate: (should) => {
        set({ shouldAnimate: should });
      },
      cameFromOnboarding: false,
      setCameFromOnboarding: (from) => {
        set({ cameFromOnboarding: from });
      },
      
      // Pension calculation settings
      useInflationAdjustment: false, // Default: nominell avkastning
      setUseInflationAdjustment: (use) => {
        set({ useInflationAdjustment: use });
      }
    }),
    {
      name: 'formogenhetskompassen-draft',
      // Spara både draftHousehold, previousLevel och useInflationAdjustment
      partialize: (state) => ({ 
        draftHousehold: state.draftHousehold,
        previousLevel: state.previousLevel,
        useInflationAdjustment: state.useInflationAdjustment
      })
    }
  )
);
