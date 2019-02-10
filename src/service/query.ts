import Knex from 'knex';

import { LatLon } from './util';

export const getUserLocationQuery = (knex: Knex) =>
  (userId: number): PromiseLike<string> =>
    knex.raw(`
      select
        st_asgeojson(location.latlon) as latlon
      from user
      where id = ?
    `, [userId]).then(rows => rows[0].latlon);

export const setOrderLocationQuery = (knex: Knex) =>
  (orderId: number, latlon: LatLon): PromiseLike<void> =>
    knex.raw(`
      update order
      set
        latlon = st_setsrid(st_makepoint(?, ?), 4326)
      where id = ?
    `, [latlon.lon, latlon.lat, orderId]);

export const markOrderDeliveredQuery = (knex: Knex) =>
  (orderId: number): PromiseLike<void> =>
    knex.raw(`
      update order
      set
        delivered_at = now()
      where id = ?
    `, [orderId]);

export const getProjectionQuery = (knex: Knex) => (
  latlon: LatLon,
  distanceMetres: number,
  degreesFromNorthCCW: number
): PromiseLike<string> =>
    knex.raw(`
      select
        st_asgeojson(
          st_project(
            st_setsrid(st_makepoint(?, ?), 4326),
            ?,
            radians(?)
          )
        ) as latlon
    `, [latlon.lon, latlon.lat, distanceMetres, degreesFromNorthCCW])
