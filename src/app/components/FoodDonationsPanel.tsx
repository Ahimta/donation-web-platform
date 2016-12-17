/// <reference path="../../../typings/index.d.ts" />

import * as React from 'react';
import {Button, ButtonGroup, Panel, Table} from 'react-bootstrap';

import * as database from '../database';
import * as helpers from '../helpers';
import t from '../translate';

interface IFoodDonationsPanelProps {
  donations: any[];
  onUpdate: Function;
}

interface IFoodDonationsPanelState {}

export default class FoodDonationsPanel extends React.Component<IFoodDonationsPanelProps, IFoodDonationsPanelState> {
  public static contextTypes = {
    currentId: React.PropTypes.string
  };

  public static defaultProps = {
    donations: []
  };

  public static propTypes = {
    donations: React.PropTypes.array.isRequired,
    onUpdate: React.PropTypes.func.isRequired
  };

  public context: {
    currentId: string
  };

  render() {
    const {currentId} = this.context;
    const {donations, onUpdate} = this.props;
    const FoodDonations = this.mapDonations(onUpdate, donations, this.deleteDonationFactory, currentId);

    return (
      <Panel header='تبرعات طعام' bsStyle='primary' className='text-center' collapsible defaultExpanded>
        <Table dir='rtl' bordered condensed fill hover responsive>
          <thead>
            <tr>
              <th className='text-center'>النوع</th>
              <th className='text-center'>المناسبة</th>
              <th className='text-center'>الموقع</th>
              <th className='text-center'>إدارة</th>
            </tr>
          </thead>
          <tbody>
            {FoodDonations}
          </tbody>
        </Table>
      </Panel>
    );
  }

  private deleteDonationFactory(onUpdate: Function, id: string) {
    return () => {
      database.removeDonation('food', id).then(() => {
        onUpdate();
      });
    };
  }

  private mapDonations(onUpdate: Function, donations: any, deleteDonationFactory: Function, currentId?: string): any[] {
    return donations.map((donation) => {
      return (
        <tr className={helpers.getDonationRowClass(currentId, donation.deliveredOrReceived, donation.reserverId)}
          key={donation['.key']}>
          <td className='text-center'>{t(donation.type)}</td>
          <td className='text-center'>{t(donation.occasion)}</td>
          <td className='text-center'>{t(donation.location)}</td>
          <td className='text-center'>
            <ButtonGroup bsSize='xs'>
              <Button bsStyle='danger' onClick={deleteDonationFactory(onUpdate, donation['.key'])} disabled={currentId !== donation.donorId}>حذف</Button>
              <Button bsStyle='success' href={`#/donations/food/${donation['.key']}`}>تفاصيل أكثر</Button>
            </ButtonGroup>
          </td>
        </tr>
      );
    });
  }
}
