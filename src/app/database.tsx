import firebase from 'firebase';
import * as Immutable from 'immutable';
import moment from 'moment';

import IActivity from './types/IActivity';
import ICharity from './types/ICharity';
import IDonation from './types/IDonation';
import IReservation from './types/IReservation';
import DonationType from './types/DonationType';
import ReservationType from './types/ReservationType';
import UserRole from './types/UserRole';

export function getCharity(id: string): Promise<ICharity> {
  return firebase.database().ref('charities').child(id).once('value').then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return Promise.reject({ code: 404 });
    }
  });
}

export function getCharities(): Promise<ReadonlyArray<ICharity>> {
  return firebase.database().ref('charities').once('value').then((snapshot) => {
    if (snapshot.exists()) {
      const charities = [];

      snapshot.forEach((childSnapshot) => {
        const value = Immutable.Map(childSnapshot.val()).merge({ '.key': childSnapshot.key }).toJS();
        charities.push(value);
      });

      return charities;
    } else {
      return [];
    }
  });
}

function getRefName(donationType: DonationType) {
  return (donationType === 'food') ? 'foodDonations' : 'nonfoodDonations';
}

export function removeDonation(donationType: DonationType, donationId: string): Promise<void> {
  return firebase.database().ref(getRefName(donationType)).child(donationId).remove().then(() => {
    console.log('Remove succeeded.');
  }).catch((error) => {
    console.log('Remove failed: ' + error.message);
  });
}

export function getDonation(donationType: DonationType, donationId: string): Promise<({ donation: IDonation, reservation: IReservation })> {
  const refName = getRefName(donationType);

  return firebase.database().ref(refName).child(donationId).once('value').then((snapshot) => {
    if (snapshot.exists()) {
      const donation: IDonation = snapshot.val();
      const reservationPromise = firebase.database().ref('reservations').child(donationId).once('value');

      return Promise.all([Promise.resolve(donation), reservationPromise]);
    } else {
      return Promise.reject({ code: 404, description: 'Donation does not exist' });
    }
  }).then(([donation, reservationSnapshot]) => {
    return { donation, reservation: reservationSnapshot.val() };
  });
}

export function getAllDonations() {
  return Promise.all([getDonations('food'), getDonations('nonfood')]).then(([foodDonations, nonfoodDonations]) => {
    return { foodDonations, nonfoodDonations };
  });
}

export function cancelReservation(donationType: DonationType, donationId: string, userRole: UserRole, userId: string): Promise<[any, any]> {
  const activity: IActivity = {
    actionName: 'cancel-reservation',
    datetime: moment().toObject(),
    donationId,
    donationType,
    userId: userId,
    userRole: userRole
  };
  const reservation: IReservation = {
    deliveredOrReceived: false,
    reserverId: null,
    type: null
  };

  const activityPromise = firebase.database().ref('activity').push(activity);
  const reservationPromise = firebase.database().ref('reservations').child(donationId).update(reservation);

  return Promise.all([activityPromise, reservationPromise]);
}

export function reportDonation(donationType: DonationType, donationId: string, reservationType: ReservationType, userRole: UserRole, userId: string): Promise<[any, any]> {
  const activity: IActivity = {
    actionName: 'delivery',
    datetime: moment().toObject(),
    donationId,
    donationType,
    userId,
    userRole
  };
  const activityPromise = (reservationType === 'delivery') ? firebase.database().ref('activity').push(activity) : Promise.resolve({});
  const reservationPromise = firebase.database().ref('reservations').child(donationId).child('deliveredOrReceived').set(true);

  return Promise.all([activityPromise, reservationPromise]);
}

export function reserveDonation(donationType: DonationType, donationId: string, reservationType: ReservationType, userRole: UserRole, currentUserId: string): Promise<[any, any]> {
  const activity: IActivity = {
    actionName: 'reservation',
    datetime: moment().toObject(),
    donationId,
    donationType,
    userId: currentUserId,
    userRole: userRole
  };
  const reservation: IReservation = {
    deliveredOrReceived: false,
    reserverId: currentUserId,
    type: reservationType
  };

  const activityPromise = (reservationType === 'delivery') ? firebase.database().ref('activity').push(activity) : Promise.resolve({});
  const reservationPromise = firebase.database().ref('reservations').child(donationId).set(reservation);

  return Promise.all([activityPromise, reservationPromise]);
}

export function createDonation(donationType: DonationType, donation: IDonation): Promise<string> {
  const refName = getRefName(donationType);
  const donationsRef = firebase.database().ref(refName);
  const newDonationKey = donationsRef.push().key;

  const activity: IActivity = {
    actionName: 'donation',
    datetime: moment().toObject(),
    donationId: newDonationKey,
    donationType: donationType,
    userId: donation.donorId,
    userRole: 'user'
  };
  const reservation: IReservation = {
    deliveredOrReceived: false,
    type: null,
    reserverId: null
  };

  return donationsRef.child(newDonationKey).set(donation).then(() => {
    const activityPromise = firebase.database().ref('activity').push(activity);
    const reservationPromise = firebase.database().ref('reservations').child(newDonationKey).set(reservation);
    return Promise.all([activityPromise, reservationPromise]);
  }).then(() => {
    return newDonationKey;
  });
}

export function getDonations(donationType: DonationType): Promise<IDonation[]> {
  const refName = getRefName(donationType);

  const donationsRef = firebase.database().ref(refName);
  const reservationsRef = firebase.database().ref('reservations');

  const promises = [donationsRef.once('value'), reservationsRef.once('value')];
  return Promise.all(promises).then(([donationsSnapshot, reservationsSnapshot]) => {
    const donations = [];
    const reservations = reservationsSnapshot.val() || [];

    donationsSnapshot.forEach((donationSnapshot) => {
      const donation = donationSnapshot.val();
      const key = donationSnapshot.key;
      const reservation = reservations[key];
      const reservationType = reservation && reservation.type;

      const fullDonation = Immutable.Map(reservation).merge(donation).merge({ '.key': key, reservationType }).toObject();
      donations.push(fullDonation);
    });

    return donations;
  });
}

export function getActivity(): Promise<IActivity[]> {
  const activityPromise = firebase.database().ref('activity').once('value');
  const charitiesPromise = firebase.database().ref('charities').once('value');
  const foodDonationsPromise = firebase.database().ref('foodDonations').once('value');
  const nonfoodDonationsPromise = firebase.database().ref('nonfoodDonations').once('value');

  const promises = [activityPromise, charitiesPromise, foodDonationsPromise, nonfoodDonationsPromise];
  return Promise.all(promises).then(([activitySnapshot, charitiesSnapshot, foodDonationsSnapshot, nonfoodDonationsSnapshot]) => {
    const activity = [];
    const charities = charitiesSnapshot.val() || [];
    const foodDonations = foodDonationsSnapshot.val() || [];
    const nonfoodDonations = nonfoodDonationsSnapshot.val() || [];

    activitySnapshot.forEach((snapshot) => {
      const key = snapshot.key;
      const value: IActivity = snapshot.val();

      const donation = foodDonations[value.donationId] || nonfoodDonations[value.donationId];
      const user = charities[value.userId];
      const fullActivity = Immutable.Map(value).merge({ donation, user }).merge({ '.key': key }).toJS();

      activity.push(fullActivity);
    });

    return activity.reverse();
  });
}
