import type {AwardedDTO} from "../../modules/eNabavki/data/dto/AwardedContract.dto";
import type { ChangesInAwardedDTO } from "../../modules/eNabavki/data/dto/ChangesInAwardedContract.dto";
import type {RealisedDTO} from "../../modules/eNabavki/data/dto/RealisedDTO";
import {ENABAVKI_EVENTS} from "../../modules/eNabavki/data/events";

type AnyDTO = AwardedDTO | ChangesInAwardedDTO | RealisedDTO;

export function mapEventToEmbed(event: string, dto: AnyDTO) {
    const safe = (v: any) => v ?? "N/A";
    const money = (v: number | null) =>
        v == null ? "N/A" : v.toLocaleString("mk-MK") + " ден.";

    switch (event) {

        case ENABAVKI_EVENTS.NEW_AWARDED_CONTRACTS: {
            const d = dto as AwardedDTO;

            return {
                title: "Нов склучен договор",
                color: 0x3498db,
                fields: [
                    { name: "Број на оглас", value: safe(d.processNumber)},
                    { name: "Договорен орган", value: safe(d.institution?.name)},
                    { name: "Носител на набавката", value: safe(d.contractor?.name)},
                    { name: "Предмет на договорот", value: safe(d.subject) },
                    { name: "Вид на договор", value: safe(d.contractType?.name), inline: true },
                    { name: "Вид на постапка", value: safe(d.procedureType?.name), inline: true },
                    { name: "Вид на понуда", value: safe(d.offerType?.name), inline: true },
                    { name: "Проценета вредност на договорот", value: money(d.estimatedContractValue), inline: true },
                    { name: "Вредност на договорот", value: money(d.assignedContractValue), inline: true },
                    { name: "Датум на објава", value: safe(d.assignmentDate), inline: true },
                ],
                timestamp: new Date().toISOString(),
            };
        }

        case ENABAVKI_EVENTS.CHANGES_IN_AWARDED_CONTRACTS: {
            const d = dto as ChangesInAwardedDTO;

            return {
                title: "Измена на склучен договор",
                color: 0xe67e22,
                fields: [
                    { name: "Број на оглас", value: safe(d.processNumber)},
                    { name: "Договорен орган", value: safe(d.institution?.name)},
                    { name: "Носител на набавката", value: safe(d.contractor?.name)},
                    { name: "Предмет на договорот", value: safe(d.subject) },
                    { name: "Причина за измена", value: safe(d.changeReason?.name) },
                    { name: "Вредност на договорот", value: money(d.assignedContractValue), inline: true },
                    { name: "Измена на вредност на договорот", value: money(d.updatedContractValue), inline: true },
                    { name: "Вредност на измената", value: money(d.differenceInValue), inline: true },
                    { name: "Датум на измена", value: safe(d.changeDate), inline: true },
                ],
                timestamp: new Date().toISOString(),
            };
        }

        case ENABAVKI_EVENTS.NEW_REALISED_CONTRACTS: {
            const d = dto as RealisedDTO;

            return {
                title: "Нов реализиран договор",
                color: 0x2ecc71,
                fields: [
                    { name: "Број на оглас", value: safe(d.processNumber)},
                    { name: "Договорен орган", value: safe(d.institution?.name)},
                    { name: "Носител на набавката", value: safe(d.contractor?.name) },
                    { name: "Предмет на договорот", value: safe(d.subject) },
                    { name: "Вид на договор", value: safe(d.contractType?.name), inline: true },
                    { name: "Вид на постапка", value: safe(d.procedureType?.name), inline: true },
                    { name: "Вид на понуда", value: safe(d.offerType?.name), inline: true },
                    { name: "Вредност на склучениот договор", value: money(d.assignedContractValue), inline: true },
                    { name: "Вредност на реализираниот договор", value: money(d.realisedContractValue), inline: true },
                    { name: "Вредност на исплата на реализиран договор", value: money(d.paidContractValue), inline: true },
                    { name: "Датум на објава", value: safe(d.deliveryDate), inline: true },
                ],
                timestamp: new Date().toISOString(),
            };
        }

        default:
            throw new Error(`Unsupported event type: ${event}`);
    }
}