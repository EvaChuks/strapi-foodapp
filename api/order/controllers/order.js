"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const stripe = require("stripe")(
  "sk_test_51JvyplSFZe05x8Cr1PREHm9h409y3yGRx2w9VdHML1x91jyAstdRo6nRQPbufmZNTghvMnylfCxgNJh9qYjqdUgn00Ovv4pYWp"
);
module.exports = {
  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.order.search(ctx.query);
    } else {
      return strapi.services.order.fetchAll(ctx.query);
    }
  },
  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }
    return strapi.services.order.fetch(ctx.params);
  },
  count: async (ctx) => {
    return strapi.services.order.count(ctx.query);
  },
  create: async (ctx) => {
    const { address, amount, dishes, token, city, state, cardHolder } =
      JSON.parse(ctx.request.body);
    const stripeAmount = Math.floor(amount * 100);
    const charge = await stripe.charges.create({
      amount: stripeAmount,
      currency: "inr",
      description: `order ${new Date()} by ${ctx.state.user._id}`,
      source: token,
    });
    const order = await strapi.services.order.create({
      user: ctx.state.user._id,
      charge_id: charge.id,
      amount: stripeAmount,
      address,
      dishes,
      city,
      state,
      cardHolder,
    });
    return order;
  },
  update: async (ctx, next) => {
    return strapi.services.order.edit(ctx.params, ctx.request.body);
  },
  destroy: async (ctx, next) => {
    return strapi.services.order.remove(ctx.params);
  },
};
