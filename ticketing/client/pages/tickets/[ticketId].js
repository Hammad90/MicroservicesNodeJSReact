import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = ({ ticket }) => {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    })
    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>Price: {ticket.price}</h4>
            {errors}
            <button onClick={() => doRequest()} className="btn btn-primary">Purchase</button>
            <div className="alert alert-info mt-5">
                <h5>To complete the purchase you can try 
                this credit card "4242 4242 4242 4242" with any dates and cvv</h5>
            </div>
        </div>
    );
};

TicketShow.getInitialProps = async (context, client) => {
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);
    return { ticket: data };
};

export default TicketShow;