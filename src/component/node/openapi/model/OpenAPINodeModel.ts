import {GraphModel, HtmlNodeModel, LogicFlow} from "@logicflow/core";
import {CONNECTOR_NODE_HEIGHT, CONNECTOR_NODE_WIDTH, NODE_Z_INDEX,} from "@/constant";
import {OPENAPI_NODE} from "@/constant/ComponentType";
import {getLocale} from "@/util/LocaleUtil";
import Designer from "@/core/Designer";
import {Layout} from "@/type";

class OpenAPINodeModel extends HtmlNodeModel {
    constructor(data: LogicFlow.NodeConfig, graphModel: GraphModel) {
        if (!data.id) {
            data.id = `${Designer.getInstance().idGenerator.getId()}`;
        }
        const language = getLocale();
        data.properties = {
            locale: language,
            validator: false,
            ...data.properties,
        };
        super(data, graphModel);
        this.setZIndex(NODE_Z_INDEX);
        this.xModelType = OPENAPI_NODE;
    }

    setAttributes() {
        this.width = CONNECTOR_NODE_WIDTH;
        this.height = CONNECTOR_NODE_HEIGHT;
        this.text.editable = false;
    }

    // setHeight(val: number) {
    //   this.height = val;
    // }

    /**
     * 重写此方法，不显示外边框
     *
     * @returns
     */
    getOutlineStyle() {
        const style = super.getOutlineStyle();
        style.stroke = "none";
        style.hover!.stroke = "none";
        return style;
    }

    getDefaultAnchor() {
        const designer = Designer.getInstance();
        const {id, x, y, width, height} = this;
        const anchors = [];
        if (designer.layoutType === Layout.HORIZONTAL) {
            anchors.push({
                x: x - width / 2,
                y,
                id: `${id}_in_y`,
                type: "in",
            });
            anchors.push({
                x: x + width / 2,
                y,
                id: `${id}_out_y`,
                type: "out",
            });
        }
        if (designer.layoutType === Layout.VERTICAL) {
            anchors.push({
                x,
                y: y - height / 2,
                id: `${id}_in_x`,
                type: "in",
            });
            anchors.push({
                x,
                y: y + height / 2,
                id: `${id}_out_x`,
                type: "out",
            });
        }
        return anchors;
    }
}

export default OpenAPINodeModel;
