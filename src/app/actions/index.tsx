import * as database from '../database';
import DonationType from '../types/DonationType';
import NetworkStatus from '../types/NetworkStatus';

export function fetchAllDonations() {
  const donationsPromise = database.getAllDonations();
  return {type: 'FETCH_ALL_DONATIONS', payload: donationsPromise};
}

export function fetchActivity(userId?: string) {
  const activityPromise = database.getActivity(userId);

  return {type: 'FETCH_ACTIVITY', payload: activityPromise};
}

export function fetchCharities() {
  const charitiesPromise = database.getCharities();
  return {type: 'FETCH_CHARITIES', payload: charitiesPromise};
}

export function fetchCharity(id: string) {
  const charityPromise = database.getCharity(id);
  return {type: 'FETCH_CHARITY', payload: charityPromise};
}

export function fetchDonation(donationType: DonationType, donationId: string) {
  const donationPromise = database.getDonation(donationType, donationId);
  return {type: 'FETCH_DONATION', payload: donationPromise};
}

export function fetchUser(userId: string) {
  const userPromise = database.getUser(userId);
  return {type: 'FETCH_USER', payload: userPromise};
}

export function removeDonation(donationType: DonationType, donationId: string) {
  const donationsPromise = database.removeDonation(donationType, donationId).then(() => {
    return database.getAllDonations();
  });

  return {type: 'REMOVE_DONATION', payload: donationsPromise};
}

export function setCurrentUser(currentUser: { charityId: string, id: string, role: string, userId: string }) {
  return {type: 'SET_CURRENT_USER', payload: currentUser};
}

export function setNetworkStatus(status: NetworkStatus) {
  return {type: 'SET_NETWORK_STATUS', payload: status};
}
