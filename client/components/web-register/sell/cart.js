import React, {Component} from 'react'
import {Accordion, Button, Panel} from 'react-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

export default class Cart extends Component {
    constructor(props) {
        super(props)
        document.title = 'Foodlex'
        this.state = {billPrice: 0}
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.cart !== this.props.cart) {
            let price = 0
            const items = nextProps.cart
            items.map((item) => {
                price = price + Number.parseInt(item.price)
            })
            this.setState({billPrice: price})
        }
    }

    addOrders(event) {
        event.preventDefault()

        Meteor.call('orders.insert', {
            createdAt: new Date(),
            items: this.state.cart,
            bill: this.state.billPrice,
            status: 'pending',
            assignedTo: 'none',
            createdBy: Meteor.user().username
        }, (err) => {
            if (err) {
                console.log('Error Placing order')
            } else {
                console.log('Order Placed')
                this.close()
            }
        })
        this.setState({billPrice: 0})
        this.props.emptyCart()
    }

    quantity() {
        let quantity = 1
        return (
            <div>
                <Button onClick={() => {
                    quantity--
                }}>-</Button>
                <div>{quantity}</div>
                <Button onClick={() => {
                    quantity++
                }}>+</Button>
            </div>
        )
    }

    static printInvoice() {
        const content = document.querySelector('.divcontents')
        const pri = document.getElementById('ifmcontentstoprint').contentWindow
        pri.document.open()
        pri.document.write('<html>' +
            '<head>' +
            '<link rel="stylesheet" href="/stylesheets/print.css">' +
            '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" ' +
            'integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" ' +
            'crossorigin="anonymous">' +
            '</head>' +
            '<body>')
        pri.document.write(content.innerHTML)
        pri.document.write('</body>')
        pri.document.close()
        pri.focus()
        pri.print()
    }

    renderFood() {
        return this.props.cart.map((item) => {
            console.log(item)
            return <li key={item._id}>{item.name}</li>
        })
    }

    render() {
        return (
            <div>
                <h1>Cart</h1>
                <Accordion>
                    <Panel>
                        <BootstrapTable data={this.props.cart} keyField="name">
                            <TableHeaderColumn dataField='name'
                                               dataSort={true}
                            >Product Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
                            <TableHeaderColumn dataField='price'
                                               dataSort={true}
                            >Product Price</TableHeaderColumn>
                            <TableHeaderColumn dataField='quantity'
                                               dataFormat={this.quantity.bind(this)}
                            >Quantity</TableHeaderColumn>
                            <TableHeaderColumn dataField='discount'>Discount</TableHeaderColumn>
                        </BootstrapTable>
                    </Panel>
                </Accordion>
                <h3>Billing amount</h3>
                <h3>{this.state.billPrice}</h3>
                <Button onClick={this.addOrders.bind(this)} bsStyle="success">Checkout</Button>
                <Button onClick={Cart.printInvoice.bind(this)} bsStyle={'success'}>Print</Button>
                <iframe id="ifmcontentstoprint" style={{height: 0, width: 0, position: 'absolute'}}/>

                <div className={'divcontents'}>
                    <div className={'printable'}>
                        <img src={'/foodlex.png'} style={{width: 72}}/> <h1 className={'pull-right'}>Foodlex</h1>
                    </div>
                    {this.renderFood()}
                </div>
            </div>
        )
    }
}