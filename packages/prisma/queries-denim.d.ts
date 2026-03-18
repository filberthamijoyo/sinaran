/**
 * Query functions for Indigo/Weaving (Denim) Division
 *
 * These are ready-to-use typed query functions that wrap Prisma's query engine.
 * Import and use these functions in your API routes or services.
 *
 * Usage:
 *   import { getFullPipeline, getWeavingByDateRange, ... } from './queries-denim';
 */
import { PrismaClient, Prisma } from '@prisma/client';
declare const prisma: PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel, import(".prisma/client/runtime/library").DefaultArgs>;
/**
 * a) getFullPipeline
 *
 * Fetches the full pipeline for a KP by manually joining:
 * - SalesContract
 * - WarpingRun (via KP match)
 * - WarpingBeam (via WarpingRun)
 * - IndigoRun (via KP match)
 * - WeavingRecord (via KP match)
 *
 * @param kp - The KP (contract number) to search for
 * @returns Object with all pipeline data, or null if not found
 */
export declare function getFullPipeline(kp: string): Promise<{
    sc: {
        id: number;
        kp: string;
        tgl: Date;
        permintaan: string | null;
        codename: string | null;
        kons_kode: string | null;
        kode_number: string | null;
        kat_kode: string | null;
        ket_ct_ws: string | null;
        ket_warna: string | null;
        status: string | null;
        te: Prisma.Decimal | null;
        sisir: string | null;
        p_kons: string | null;
        ne_k_lusi: string | null;
        ne_lusi: Prisma.Decimal | null;
        sp_lusi: string | null;
        lot_lusi: string | null;
        ne_k_pakan: string | null;
        ne_pakan: Prisma.Decimal | null;
        sp_pakan: string | null;
        j: Prisma.Decimal | null;
        j_c: Prisma.Decimal | null;
        b_c: Prisma.Decimal | null;
        tb: Prisma.Decimal | null;
        bale_lusi: Prisma.Decimal | null;
        total_pakan: Prisma.Decimal | null;
        bale_pakan: Prisma.Decimal | null;
        ts: Date | null;
        sacon: boolean;
        acc: string | null;
        proses: string | null;
        foto_sacon: string | null;
        remarks: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        pipeline_status: string;
        weaving_confirmed_at: Date | null;
        kp_sequence: number | null;
        kp_status: string;
        archived_at: Date | null;
        archived_kp: string | null;
        rejection_reason: string | null;
    };
    warping: {
        beams: {
            id: number;
            kp: string;
            created_at: Date;
            warping_run_id: number;
            position: number;
            beam_number: number;
            putusan: number | null;
            jumlah_ends: number | null;
            panjang_beam: number | null;
        }[];
    } & {
        id: number;
        kp: string;
        tgl: Date;
        te: Prisma.Decimal | null;
        created_at: Date;
        updated_at: Date;
        rpm: number | null;
        start_time: string | null;
        stop_time: string | null;
        kode_full: string | null;
        benang: string | null;
        lot: string | null;
        sp: string | null;
        pt: number | null;
        mtr_min: Prisma.Decimal | null;
        total_putusan: number | null;
        data_putusan: string | null;
        total_beam: number | null;
        cn_1: Prisma.Decimal | null;
        jam: Prisma.Decimal | null;
        total_waktu: Prisma.Decimal | null;
        eff_warping: Prisma.Decimal | null;
        no_mc: number | null;
        elongasi: Prisma.Decimal | null;
        strength: Prisma.Decimal | null;
        cv_pct: Prisma.Decimal | null;
        tension_badan: number | null;
        tension_pinggir: number | null;
        lebar_creel: number | null;
        mtr_per_min: number | null;
        start: string | null;
        stop: string | null;
    };
    indigo: {
        id: number;
        kp: string;
        tgl: Date | null;
        te: Prisma.Decimal | null;
        created_at: Date;
        updated_at: Date;
        tanggal: Date;
        keterangan: string | null;
        kode_full: string | null;
        strength: Prisma.Decimal | null;
        cv_pct: Prisma.Decimal | null;
        start: string | null;
        stop: string | null;
        mc: Prisma.Decimal | null;
        ne: string | null;
        p: Prisma.Decimal | null;
        bb: Prisma.Decimal | null;
        speed: Prisma.Decimal | null;
        bak_celup: Prisma.Decimal | null;
        bak_sulfur: Prisma.Decimal | null;
        konst_idg: Prisma.Decimal | null;
        konst_sulfur: Prisma.Decimal | null;
        visc: Prisma.Decimal | null;
        ref: Prisma.Decimal | null;
        size_box: Prisma.Decimal | null;
        scoring: Prisma.Decimal | null;
        jetsize: Prisma.Decimal | null;
        polisize_hs: Prisma.Decimal | null;
        polisize_1_2: Prisma.Decimal | null;
        armosize: Prisma.Decimal | null;
        armosize_1_1: Prisma.Decimal | null;
        armosize_1_2: Prisma.Decimal | null;
        armosize_1_3: Prisma.Decimal | null;
        armosize_1_5: Prisma.Decimal | null;
        armosize_1_7: Prisma.Decimal | null;
        quqlaxe: Prisma.Decimal | null;
        armo_c: Prisma.Decimal | null;
        vit_e: Prisma.Decimal | null;
        armo_d: Prisma.Decimal | null;
        tapioca: Prisma.Decimal | null;
        a_308: Prisma.Decimal | null;
        indigo: Prisma.Decimal | null;
        caustic: Prisma.Decimal | null;
        hydro: Prisma.Decimal | null;
        solopol: Prisma.Decimal | null;
        serawet: Prisma.Decimal | null;
        primasol: Prisma.Decimal | null;
        cottoclarin: Prisma.Decimal | null;
        setamol: Prisma.Decimal | null;
        granular: Prisma.Decimal | null;
        granule: Prisma.Decimal | null;
        grain: Prisma.Decimal | null;
        wet_matic: Prisma.Decimal | null;
        fisat: Prisma.Decimal | null;
        breviol: Prisma.Decimal | null;
        csk: Prisma.Decimal | null;
        comee: Prisma.Decimal | null;
        dirsol_rdp: Prisma.Decimal | null;
        primasol_nf: Prisma.Decimal | null;
        zolopol_phtr: Prisma.Decimal | null;
        cottoclarin_2: Prisma.Decimal | null;
        sanwet: Prisma.Decimal | null;
        marcerize_caustic: Prisma.Decimal | null;
        sanmercer: Prisma.Decimal | null;
        sancomplex: Prisma.Decimal | null;
        exsess_caustic: Prisma.Decimal | null;
        exsess_hydro: Prisma.Decimal | null;
        dextoor: Prisma.Decimal | null;
        ltr: Prisma.Decimal | null;
        diresol_black_kas: Prisma.Decimal | null;
        sansul_sdc: Prisma.Decimal | null;
        caustic_2: Prisma.Decimal | null;
        dextros: Prisma.Decimal | null;
        solopol_2: Prisma.Decimal | null;
        primasol_2: Prisma.Decimal | null;
        serawet_2: Prisma.Decimal | null;
        cottoclarin_3: Prisma.Decimal | null;
        saneutral: Prisma.Decimal | null;
        dextrose_adjust: Prisma.Decimal | null;
        optifik_rsl: Prisma.Decimal | null;
        ekalin_f: Prisma.Decimal | null;
        solopol_phtr: Prisma.Decimal | null;
        moisture_mahlo: Prisma.Decimal | null;
        temp_dryer: Prisma.Decimal | null;
        temp_mid_dryer: Prisma.Decimal | null;
        temp_size_box_1: Prisma.Decimal | null;
        temp_size_box_2: Prisma.Decimal | null;
        size_box_1: Prisma.Decimal | null;
        size_box_2: Prisma.Decimal | null;
        squeezing_roll_1: Prisma.Decimal | null;
        squeezing_roll_2: Prisma.Decimal | null;
        immersion_roll: Prisma.Decimal | null;
        dryer: Prisma.Decimal | null;
        take_off: Prisma.Decimal | null;
        winding: Prisma.Decimal | null;
        press_beam: Prisma.Decimal | null;
        hardness: Prisma.Decimal | null;
        hydrolic_pump_1: Prisma.Decimal | null;
        hydrolic_pump_2: Prisma.Decimal | null;
        unwinder: Prisma.Decimal | null;
        dyeing_tens_wash: Prisma.Decimal | null;
        dyeing_tens_warna: Prisma.Decimal | null;
        mc_idg: string | null;
        elongasi_idg: Prisma.Decimal | null;
        tenacity: Prisma.Decimal | null;
        bak_1: Prisma.Decimal | null;
        bak_2: Prisma.Decimal | null;
        bak_3: Prisma.Decimal | null;
        bak_4: Prisma.Decimal | null;
        bak_5: Prisma.Decimal | null;
        bak_6: Prisma.Decimal | null;
        bak_7: Prisma.Decimal | null;
        bak_8: Prisma.Decimal | null;
        bak_9: Prisma.Decimal | null;
        bak_10: Prisma.Decimal | null;
        bak_11: Prisma.Decimal | null;
        bak_12: Prisma.Decimal | null;
        bak_13: Prisma.Decimal | null;
        bak_14: Prisma.Decimal | null;
        bak_15: Prisma.Decimal | null;
        bak_16: Prisma.Decimal | null;
        bak_count: number | null;
        indigo_bak: number | null;
        indigo_conc: number | null;
        jumlah_rope: number | null;
        panjang_rope: number | null;
        sulfur_bak: number | null;
        sulfur_conc: number | null;
        total_meters: number | null;
    };
    weaving: ({
        warping_beam: {
            id: number;
            kp: string;
            created_at: Date;
            warping_run_id: number;
            position: number;
            beam_number: number;
            putusan: number | null;
            jumlah_ends: number | null;
            panjang_beam: number | null;
        };
    } & {
        id: number;
        kp: string;
        tgl: Date | null;
        created_at: Date;
        updated_at: Date;
        warping_beam_id: number | null;
        tanggal: Date;
        shift: string | null;
        machine: string | null;
        warp_supplier: string | null;
        sizing: string | null;
        beam: number | null;
        kode_kain: string | null;
        operator: string | null;
        a_pct: Prisma.Decimal | null;
        p_pct: Prisma.Decimal | null;
        rpm: Prisma.Decimal | null;
        kpicks: Prisma.Decimal | null;
        meters: Prisma.Decimal | null;
        warp_no: number | null;
        warp_stop_hr: Prisma.Decimal | null;
        warp_per_stop: Prisma.Decimal | null;
        weft_no: number | null;
        weft_stop_hr: Prisma.Decimal | null;
        weft_per_stop: Prisma.Decimal | null;
        bobbin_no: number | null;
        bobbin_stop_hr: Prisma.Decimal | null;
        bobbin_per_stop: Prisma.Decimal | null;
        stattempt_no: number | null;
        stattempt_stop_hr: Prisma.Decimal | null;
        stattempt_per_stop: Prisma.Decimal | null;
        other_stops_no: number | null;
        other_stops_time: string | null;
        long_stops_no: number | null;
        long_stops_time: string | null;
        m_s: Prisma.Decimal | null;
        b_hr: Prisma.Decimal | null;
        merk: string | null;
        area: string | null;
        beam_no: number | null;
        efficiency: number | null;
        keterangan: string | null;
        meter_out: number | null;
        no_mesin: number | null;
        pick_actual: number | null;
        synced_at: Date | null;
        source: string | null;
    })[];
    inspection: {
        id: number;
        kp: string;
        tgl: Date | null;
        j: number | null;
        created_at: Date;
        updated_at: Date;
        mc: string | null;
        weaving_record_id: number | null;
        tg: Date;
        d: string | null;
        bm: number | null;
        sn: string | null;
        sn_combined: string | null;
        gd: string | null;
        bme: Prisma.Decimal | null;
        sj: Prisma.Decimal | null;
        actual_meters: Prisma.Decimal | null;
        opg: string | null;
        tgl_potong: Date | null;
        no_pot: number | null;
        w: string | null;
        g: string | null;
        berat: number | null;
        cacat: string | null;
        grade: string | null;
        inspector_name: string | null;
        lebar: number | null;
        no_roll: number | null;
        panjang: number | null;
        bmc: number | null;
        btl: number | null;
        bts: number | null;
        pp: number | null;
        pks: number | null;
        ko: number | null;
        db: number | null;
        bl: number | null;
        ptr: number | null;
        pkt: number | null;
        fly: number | null;
        ls: number | null;
        lpb: number | null;
        p_bulu: number | null;
        smg: number | null;
        sms: number | null;
        aw: number | null;
        pl: number | null;
        na: number | null;
        lm: number | null;
        lkc: number | null;
        lks: number | null;
        ld: number | null;
        pts: number | null;
        pd: number | null;
        lkt: number | null;
        pk: number | null;
        lp: number | null;
        plc: number | null;
        kk: number | null;
        bta: number | null;
        pj: number | null;
        rp: number | null;
        pb: number | null;
        xpd: number | null;
        br: number | null;
        pss: number | null;
        luper: number | null;
        ptn: number | null;
        b_bercak: number | null;
        r_rusak: number | null;
        sl: number | null;
        p_timbul: number | null;
        b_celup: number | null;
        p_tumpuk: number | null;
        b_bar: number | null;
        sml: number | null;
        p_slub: number | null;
        p_belang: number | null;
        crossing: number | null;
        x_sambang: number | null;
        p_jelek: number | null;
        lipatan: number | null;
    }[];
    bbsf: {
        id: number;
        kp: string;
        tgl: Date;
        created_at: Date;
        updated_at: Date;
        ws_shift: string | null;
        ws_mc: string | null;
        ws_speed: number | null;
        ws_larutan_1: string | null;
        ws_temp_1: number | null;
        ws_padder_1: number | null;
        ws_dancing_1: number | null;
        ws_larutan_2: string | null;
        ws_temp_2: number | null;
        ws_padder_2: number | null;
        ws_dancing_2: number | null;
        ws_skew: number | null;
        ws_tekanan_boiler: number | null;
        ws_temp_1_zone: number | null;
        ws_temp_2_zone: number | null;
        ws_temp_3_zone: number | null;
        ws_temp_4_zone: number | null;
        ws_temp_5_zone: number | null;
        ws_temp_6_zone: number | null;
        ws_lebar_awal: number | null;
        ws_panjang_awal: number | null;
        ws_permasalahan: string | null;
        ws_pelaksana: string | null;
        sf1_shift: string | null;
        sf1_mc: string | null;
        sf1_speed: string | null;
        sf1_damping: number | null;
        sf1_press: number | null;
        sf1_tension: number | null;
        sf1_tension_limit: number | null;
        sf1_temperatur: number | null;
        sf1_susut: number | null;
        sf1_permasalahan: string | null;
        sf1_pelaksana: string | null;
        sf2_shift: string | null;
        sf2_mc: string | null;
        sf2_speed: string | null;
        sf2_damping: number | null;
        sf2_press: number | null;
        sf2_tension: number | null;
        sf2_temperatur: number | null;
        sf2_susut: number | null;
        sf2_awal: number | null;
        sf2_akhir: number | null;
        sf2_panjang: number | null;
        sf2_permasalahan: string | null;
        sf2_pelaksana: string | null;
    };
    inspectFinish: {
        id: number;
        kp: string;
        tgl: Date;
        j: number | null;
        created_at: Date;
        updated_at: Date;
        shift: string | null;
        operator: string | null;
        sn: string | null;
        tgl_potong: Date | null;
        grade: string | null;
        lebar: number | null;
        no_roll: number | null;
        bmc: number | null;
        btl: number | null;
        bts: number | null;
        pp: number | null;
        pks: number | null;
        ptr: number | null;
        smg: number | null;
        aw: number | null;
        lm: number | null;
        lkc: number | null;
        lks: number | null;
        ld: number | null;
        pts: number | null;
        pd: number | null;
        lkt: number | null;
        pk: number | null;
        lp: number | null;
        plc: number | null;
        bta: number | null;
        pb: number | null;
        pss: number | null;
        p_slub: number | null;
        kg: number | null;
        susut_lusi: number | null;
        point: number | null;
        slub: number | null;
        snl: number | null;
        losp: number | null;
        lb: number | null;
        ptm: number | null;
        pkl: number | null;
        lki: number | null;
        lptd: number | null;
        exst: number | null;
        noda: string | null;
        kotor: string | null;
        bkrt: string | null;
        ket: string | null;
        blpt_grey: string | null;
        bl_ws: number | null;
        bl_bb: string | null;
    }[];
}>;
/**
 * b) getWeavingByDateRange
 *
 * Fetches all WeavingRecords between two dates.
 *
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of WeavingRecords with warping_beam relations
 */
export declare function getWeavingByDateRange(startDate: Date, endDate: Date): Promise<Prisma.WeavingRecordGetPayload<{
    include: {
        warping_beam: true;
    };
}>[]>;
/**
 * c) getInspectGrayByBeam
 *
 * Fetches all InspectGrayRecords for a given beam number.
 *
 * @param beamNumber - The beam number to search for
 * @returns Array of InspectGrayRecords with weaving_record relations
 */
export declare function getInspectGrayByBeam(beamNumber: number): Promise<Prisma.InspectGrayRecordGetPayload<{
    include: {
        weaving_record: {
            select: {
                machine: true;
                shift: true;
            };
        };
    };
}>[]>;
/**
 * d) getMetersByKp
 *
 * Returns total actual_meters produced for a KP, plus count of rolls.
 *
 * @param kp - The KP (contract number)
 * @returns Object with total_meters (sum of actual_meters) and roll_count
 */
export declare function getMetersByKp(kp: string): Promise<{
    total_meters: number | Prisma.Decimal;
    roll_count: number;
}>;
/**
 * e) getActiveLoomStatus
 *
 * Returns the latest WeavingRecord per machine.
 * Shows: machine, beam, kp, meters, tanggal, shift
 *
 * @returns Array of latest WeavingRecords per machine
 */
export declare function getActiveLoomStatus(): Promise<{
    kp: string;
    tanggal: Date;
    shift: string;
    machine: string;
    beam: number;
    meters: Prisma.Decimal;
}[]>;
export { prisma };
//# sourceMappingURL=queries-denim.d.ts.map