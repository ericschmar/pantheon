import _ from 'lodash';

const Attribute = ({
  name,
  value,
}: {
  name: string;
  value: string | string[];
}) => {
  return (
    <div className="col-span-8 py-1 bg-offgray-50/40 w-full">
      <div className="flex flex-row items-center px-1 place-content-between">
        <p className="overflow-ellipsis overflow-hidden pr-1 text-xs min-w-[144px]">
          {name}
        </p>
        <div className="self-start grow-0 shrink-0 w-[160px]">
          <div className="relative m-0 box-border">
            {value?.length > 1 ? (
              <textarea
                rows={3}
                wrap="soft"
                className="px-1 rounded-xs box-border font-semibold min-h-[20px] text-xs w-full min-w-[144px] bg-offgray-100/60 text-pretty break-words"
                value={_.map(value as string[], (item) => item.trim()).join(
                  '\n',
                )}
                onChange={() => {}}
              />
            ) : (
              <input
                type="text"
                className="px-1 rounded-xs box-border font-semibold h-[20px] text-xs w-full min-w-[144px] bg-offgray-100/60"
                value={value}
                onChange={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attribute;
