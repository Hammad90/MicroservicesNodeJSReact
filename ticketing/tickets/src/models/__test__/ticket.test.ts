import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
    // Creates an instance of a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 5,
        userId: '123'
    });
    
    // Save it to the db
    await ticket.save();

    // fetch the ticket 2 times 
    const ticketOne = await Ticket.findById(ticket.id);
    const ticketTwo = await Ticket.findById(ticket.id);

    // Two separate changes to the tickets fetched
    ticketOne.set({price: 10});
    ticketTwo.set({price: 15});

    // save the first fetched ticket 
    await ticketOne.save();

    // save the second fetched ticket and expect an error
    try{
        await ticketTwo.save();
    } catch(err){
        return done();
    }
    throw new Error('Should not reach this point');
});

it('Increments version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Concert',
        price: 5,
        userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});