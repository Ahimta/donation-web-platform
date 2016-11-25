/// <reference path="../../../typings/index.d.ts" />

import firebase from 'firebase';
import * as React from 'react';
import ReactFireMixin from 'reactfire';
import reactMixin from 'react-mixin';
import {Button, Col, ControlLabel, Form, FormControl, FormGroup, Grid, InputGroup, PageHeader, Row} from 'react-bootstrap';
import {hashHistory} from 'react-router';

interface INewFoodDonationProps {
};

interface INewFoodDonationState {
  dishes: string;
  foodDonations: Object[];
  foodType: string;
  notes: string;
  occasion: string;
  phone: string;
};

class NewFoodDonation extends React.Component<INewFoodDonationProps, INewFoodDonationState> {
  static propTypes = {
  };

  constructor(props: any, context: any) {
    super(props, context);

    this.state = {
      dishes: '',
      foodDonations: [],
      foodType: 'fruits',
      notes: '',
      occasion: 'party',
      phone: ''
    };
  }

  componentWillMount() {
    this.bindAsArray(firebase.database().ref('foodDonations'), 'foodDonations');
  }

  handleSubmit(event: any) {
    const {dishes, foodType, notes, occasion, phone} = this.state;

    event.preventDefault();
    this.firebaseRefs.foodDonations.push({dishes, foodType, notes, occasion, phone});
    hashHistory.push('/');
  }

  handleOnChange(fieldName: string) {
    return (function(event: any) {
      this.setState({[fieldName]: event.target.value});
    });
  }

  render() {
    console.log(this.state);
    return (
      <section>
        <PageHeader className='text-center'>تبرع بطعام</PageHeader>
        <Grid>
          <Form onSubmit={this.handleSubmit.bind(this)}>
            <FormGroup controlId='foodDonationFoodType' dir='rtl'>
              <ControlLabel>نوع الطعام</ControlLabel>
              <FormControl componentClass='select' value={this.state.foodType} onChange={this.handleOnChange('foodType').bind(this)}>
                <option value='fruits'>فواكه</option>
                <option value='vegetables'>خضار</option>
                <option value='misc'>منوع</option>
              </FormControl>
            </FormGroup>

            <FormGroup controlId='foodDonationOccasion' dir='rtl'>
              <ControlLabel>المناسبة</ControlLabel>
              <FormControl componentClass='select' value={this.state.occasion} onChange={this.handleOnChange('occasion').bind(this)}>
                <option value='party'>حفلة</option>
                <option value='wedding'>زواج</option>
                <option value='buffet'>بوفيه مفتوح</option>
                <option value='other'>آخر</option>
              </FormControl>
            </FormGroup>

            <FormGroup controlId='pickupTime' dir='rtl'>
              <ControlLabel>وقت الاستلام</ControlLabel>
              <Row>
                <Col xs={3}><FormControl type='number' placeholder='الساعة' /></Col>
                <Col xs={3}><FormControl type='number' placeholder='اليوم' /></Col>
                <Col xs={3}><FormControl type='number' placeholder='الشهر' /></Col>
                <Col xs={3}><FormControl type='number' placeholder='السنة' /></Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <InputGroup>
                <FormControl type='text' dir='rtl' value={this.state.dishes} onChange={this.handleOnChange('dishes').bind(this)} />
                <InputGroup.Addon>الأطباق</InputGroup.Addon>
              </InputGroup>
            </FormGroup>

            <FormGroup>
              <InputGroup>
                <FormControl type='tel' dir='ltr' value={this.state.phone} onChange={this.handleOnChange('phone').bind(this)} />
                <InputGroup.Addon>الجوال/الواتساب</InputGroup.Addon>
              </InputGroup>
            </FormGroup>

            <FormGroup controlId='foodDonationFoodPhotos' dir='rtl'>
              <ControlLabel>الصور</ControlLabel>
              <FormControl type='file' placeholder='الصور' />
            </FormGroup>

            <FormGroup controlId='foodDonationNotes' dir='rtl'>
              <ControlLabel>ملاحظات</ControlLabel>
              <FormControl componentClass='textarea' placeholder='ملاحظات' value={this.state.notes} onChange={this.handleOnChange('notes').bind(this)} />
            </FormGroup>

            <FormGroup controlId='foodDonationLocation' dir='rtl'>
              <ControlLabel>الموقع</ControlLabel>
              <iframe
                width='100%'
                height='250em'
                frameBorder='0' style={{ border: 0 }}
                src='https://www.google.com/maps/embed/v1/place?key=AIzaSyDzwYGquiVtVevyr4YS9hYc5F_IeI9Qhbc&q=Huraymila'
                allowFullScreen>
              </iframe>
            </FormGroup>

            <Button type='submit' bsStyle='success' bsSize='lg' block>تبرع</Button>
          </Form>
        </Grid>
      </section>
    );
  }
}

reactMixin(NewFoodDonation.prototype, ReactFireMixin);

export default NewFoodDonation;